# Project 13: Simple Lottery

## Mô tả
Simple Lottery là một smart contract xổ số đơn giản và minh bạch trên blockchain Stacks. Người dùng có thể mua vé số, hệ thống tự động chọn số thắng cuộc và phân phối giải thưởng một cách công bằng.

## Tính năng chính
- **Buy Tickets**: Người dùng mua vé số với STX
- **Random Winner**: Hệ thống tự động chọn người thắng cuộc
- **Prize Distribution**: Phân phối giải thưởng tự động
- **Multiple Rounds**: Hỗ trợ nhiều vòng quay liên tiếp
- **Transparent**: Tất cả giao dịch đều minh bạch trên blockchain

## Cấu trúc dự án
```
project13_simple_lottery/
├── contracts/
│   └── simple-lottery.clar    # Main lottery contract
├── tests/
│   └── simple-lottery_test.ts # Unit tests
├── scripts/
│   └── deploy.ts              # Deployment script
├── Clarinet.toml              # Clarinet configuration
├── package.json               # Dependencies
└── README.md                  # Documentation
```

## Cách sử dụng

### 1. Mua vé số
```clarity
(contract-call? .simple-lottery buy-ticket)
```

### 2. Kiểm tra thông tin vòng quay hiện tại
```clarity
(contract-call? .simple-lottery get-current-round)
```

### 3. Xem lịch sử người thắng
```clarity
(contract-call? .simple-lottery get-winner u1) ;; round 1
```

### 4. Admin Functions
```clarity
;; Kết thúc vòng quay và chọn người thắng
(contract-call? .simple-lottery end-round)

;; Bắt đầu vòng quay mới
(contract-call? .simple-lottery start-new-round)
```

## Thông số kỹ thuật
- **Ticket Price**: 1 STX mỗi vé
- **Prize Pool**: 80% tổng tiền vé bán được
- **House Fee**: 20% cho contract owner
- **Min Participants**: 2 người tối thiểu mỗi vòng
- **Random Selection**: Sử dụng block hash để tạo số ngẫu nhiên

## Game Flow
1. **Start Round**: Admin bắt đầu vòng quay mới
2. **Buy Tickets**: Người dùng mua vé trong thời gian cho phép
3. **End Round**: Admin kết thúc vòng và chọn winner
4. **Prize Distribution**: Tự động chuyển tiền thưởng cho winner
5. **New Round**: Bắt đầu vòng mới

## Lợi ích
1. **Đơn giản**: Logic rõ ràng, dễ hiểu
2. **Minh bạch**: Tất cả trên blockchain, không thể gian lận
3. **Tự động**: Phân phối giải thưởng tự động
4. **Công bằng**: Sử dụng block hash để random
5. **Hiệu quả**: Code tối ưu, tiết kiệm gas

## Security Features
- Chỉ admin mới có thể start/end rounds
- Không thể mua vé khi round đã kết thúc
- Tự động validate số lượng participants tối thiểu
- Safe math để tránh overflow

## Deployment
1. Clone repository
2. Run `npm install`
3. Configure Clarinet settings
4. Deploy với `clarinet deploy`

## Testing
```bash
npm test
```
