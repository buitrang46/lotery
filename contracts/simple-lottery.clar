;; Simple Lottery Contract
;; A transparent and fair lottery system on Stacks blockchain

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant TICKET_PRICE u1000000) ;; 1 STX in microSTX
(define-constant HOUSE_FEE_PERCENT u20) ;; 20% house fee
(define-constant MIN_PARTICIPANTS u2)

;; Error codes
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_ROUND_NOT_ACTIVE (err u101))
(define-constant ERR_ROUND_ACTIVE (err u102))
(define-constant ERR_INSUFFICIENT_PARTICIPANTS (err u103))
(define-constant ERR_ALREADY_PARTICIPATED (err u104))
(define-constant ERR_INSUFFICIENT_FUNDS (err u105))
(define-constant ERR_TRANSFER_FAILED (err u106))

;; Data Variables
(define-data-var current-round uint u0)
(define-data-var round-active bool false)
(define-data-var total-collected uint u0)

;; Data Maps
(define-map round-participants
  uint
  (list 100 principal)
)
(define-map round-winners
  uint
  principal
)
(define-map round-prizes
  uint
  uint
)
(define-map user-participated
  {
    round: uint,
    user: principal,
  }
  bool
)

;; Read-only functions

;; Get current round info
(define-read-only (get-current-round)
  {
    round: (var-get current-round),
    active: (var-get round-active),
    total-collected: (var-get total-collected),
    participants: (default-to (list) (map-get? round-participants (var-get current-round))),
  }
)

;; Get round winner
(define-read-only (get-winner (round uint))
  (map-get? round-winners round)
)

;; Get round prize
(define-read-only (get-prize (round uint))
  (map-get? round-prizes round)
)

;; Check if user participated in current round
(define-read-only (has-participated (user principal))
  (default-to false
    (map-get? user-participated {
      round: (var-get current-round),
      user: user,
    })
  )
)

;; Get participants count for current round
(define-read-only (get-participants-count)
  (len (default-to (list) (map-get? round-participants (var-get current-round))))
)

;; Private functions

;; Add participant to current round
(define-private (add-participant (user principal))
  (let (
      (current-round-id (var-get current-round))
      (current-participants (default-to (list) (map-get? round-participants current-round-id)))
    )
    (begin
      (map-set round-participants current-round-id
        (unwrap-panic (as-max-len? (append current-participants user) u100))
      )
      (map-set user-participated {
        round: current-round-id,
        user: user,
      }
        true
      )
      (ok true)
    )
  )
)

;; Generate random number based on block info
(define-private (get-random-number (max uint))
  (let (
      (block-height-hash (unwrap-panic (get-block-info? id-header-hash (- block-height u1))))
      ;; Use a simple hash of block height and current round for randomness
      (pseudo-random (+ block-height (var-get current-round) (var-get total-collected)))
    )
    (mod pseudo-random max)
  )
)

;; Public functions

;; Start a new lottery round (only owner)
(define-public (start-new-round)
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (asserts! (not (var-get round-active)) ERR_ROUND_ACTIVE)

    (var-set current-round (+ (var-get current-round) u1))
    (var-set round-active true)
    (var-set total-collected u0)

    (ok (var-get current-round))
  )
)

;; Buy a lottery ticket
(define-public (buy-ticket)
  (let ((current-round-id (var-get current-round)))
    (asserts! (var-get round-active) ERR_ROUND_NOT_ACTIVE)
    (asserts! (not (has-participated tx-sender)) ERR_ALREADY_PARTICIPATED)

    ;; Transfer STX from user to contract
    (try! (stx-transfer? TICKET_PRICE tx-sender (as-contract tx-sender)))

    ;; Add participant and update total
    (unwrap-panic (add-participant tx-sender))
    (var-set total-collected (+ (var-get total-collected) TICKET_PRICE))

    (ok true)
  )
)

;; End current round and select winner (only owner)
(define-public (end-round)
  (let (
      (current-round-id (var-get current-round))
      (participants (default-to (list) (map-get? round-participants current-round-id)))
      (participants-count (len participants))
      (total-prize-pool (var-get total-collected))
      (house-fee (/ (* total-prize-pool HOUSE_FEE_PERCENT) u100))
      (winner-prize (- total-prize-pool house-fee))
    )
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (asserts! (var-get round-active) ERR_ROUND_NOT_ACTIVE)
    (asserts! (>= participants-count MIN_PARTICIPANTS)
      ERR_INSUFFICIENT_PARTICIPANTS
    )

    ;; Select random winner
    (let (
        (winner-index (get-random-number participants-count))
        (winner (unwrap-panic (element-at participants winner-index)))
      )
      ;; Record winner and prize
      (map-set round-winners current-round-id winner)
      (map-set round-prizes current-round-id winner-prize)

      ;; Transfer prize to winner
      (try! (as-contract (stx-transfer? winner-prize tx-sender winner)))

      ;; Transfer house fee to owner
      (try! (as-contract (stx-transfer? house-fee tx-sender CONTRACT_OWNER)))

      ;; End round
      (var-set round-active false)

      (ok {
        winner: winner,
        prize: winner-prize,
      })
    )
  )
)

;; Emergency function to end round without winner (only owner)
(define-public (cancel-round)
  (let (
      (current-round-id (var-get current-round))
      (participants (default-to (list) (map-get? round-participants current-round-id)))
      (refund-amount TICKET_PRICE)
    )
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (asserts! (var-get round-active) ERR_ROUND_NOT_ACTIVE)

    ;; Refund all participants
    (try! (fold refund-participant participants (ok true)))

    ;; End round
    (var-set round-active false)
    (var-set total-collected u0)

    (ok true)
  )
)

;; Helper function for refunding participants
(define-private (refund-participant
    (participant principal)
    (previous-result (response bool uint))
  )
  (match previous-result
    success (as-contract (stx-transfer? TICKET_PRICE tx-sender participant))
    error (err error)
  )
)

;; Get contract balance
(define-read-only (get-contract-balance)
  (stx-get-balance (as-contract tx-sender))
)
