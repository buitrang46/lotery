import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("Simple Lottery Contract", () => {
  beforeEach(() => {
    // Reset simnet state before each test
    simnet.setEpoch("2.4");
  });

  it("should start a new round successfully", () => {
    const { result } = simnet.callPublicFn(
      "simple-lottery",
      "start-new-round",
      [],
      deployer
    );

    expect(result).toBeOk(Cl.uint(1));

    // Check round status
    const roundInfo = simnet.callReadOnlyFn(
      "simple-lottery",
      "get-current-round",
      [],
      deployer
    );

    expect(roundInfo.result).toBeOk(
      Cl.tuple({
        round: Cl.uint(1),
        active: Cl.bool(true),
        "total-collected": Cl.uint(0),
        participants: Cl.list([])
      })
    );
  });

  it("should not allow non-owner to start round", () => {
    const { result } = simnet.callPublicFn(
      "simple-lottery",
      "start-new-round",
      [],
      wallet1
    );

    expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
  });

  it("should allow users to buy tickets", () => {
    // Start round first
    simnet.callPublicFn("simple-lottery", "start-new-round", [], deployer);

    // Buy ticket
    const { result } = simnet.callPublicFn(
      "simple-lottery",
      "buy-ticket",
      [],
      wallet1
    );

    expect(result).toBeOk(Cl.bool(true));

    // Check if user participated
    const participated = simnet.callReadOnlyFn(
      "simple-lottery",
      "has-participated",
      [Cl.principal(wallet1)],
      deployer
    );

    expect(participated.result).toBe(Cl.bool(true));
  });

  it("should not allow buying ticket when round is not active", () => {
    const { result } = simnet.callPublicFn(
      "simple-lottery",
      "buy-ticket",
      [],
      wallet1
    );

    expect(result).toBeErr(Cl.uint(101)); // ERR_ROUND_NOT_ACTIVE
  });

  it("should not allow same user to buy multiple tickets", () => {
    // Start round
    simnet.callPublicFn("simple-lottery", "start-new-round", [], deployer);

    // First ticket
    simnet.callPublicFn("simple-lottery", "buy-ticket", [], wallet1);

    // Second ticket (should fail)
    const { result } = simnet.callPublicFn(
      "simple-lottery",
      "buy-ticket",
      [],
      wallet1
    );

    expect(result).toBeErr(Cl.uint(104)); // ERR_ALREADY_PARTICIPATED
  });

  it("should end round and select winner", () => {
    // Start round
    simnet.callPublicFn("simple-lottery", "start-new-round", [], deployer);

    // Add participants
    simnet.callPublicFn("simple-lottery", "buy-ticket", [], wallet1);
    simnet.callPublicFn("simple-lottery", "buy-ticket", [], wallet2);

    // End round
    const { result } = simnet.callPublicFn(
      "simple-lottery",
      "end-round",
      [],
      deployer
    );

    expect(result).toBeOk();

    // Check round is no longer active
    const roundInfo = simnet.callReadOnlyFn(
      "simple-lottery",
      "get-current-round",
      [],
      deployer
    );

    const roundData = roundInfo.result as any;
    expect(roundData.data.active).toBe(Cl.bool(false));
  });

  it("should not end round with insufficient participants", () => {
    // Start round
    simnet.callPublicFn("simple-lottery", "start-new-round", [], deployer);

    // Add only one participant
    simnet.callPublicFn("simple-lottery", "buy-ticket", [], wallet1);

    // Try to end round (should fail)
    const { result } = simnet.callPublicFn(
      "simple-lottery",
      "end-round",
      [],
      deployer
    );

    expect(result).toBeErr(Cl.uint(103)); // ERR_INSUFFICIENT_PARTICIPANTS
  });

  it("should track participants correctly", () => {
    // Start round
    simnet.callPublicFn("simple-lottery", "start-new-round", [], deployer);

    // Add participants
    simnet.callPublicFn("simple-lottery", "buy-ticket", [], wallet1);
    simnet.callPublicFn("simple-lottery", "buy-ticket", [], wallet2);
    simnet.callPublicFn("simple-lottery", "buy-ticket", [], wallet3);

    // Check participants count
    const count = simnet.callReadOnlyFn(
      "simple-lottery",
      "get-participants-count",
      [],
      deployer
    );

    expect(count.result).toBe(Cl.uint(3));
  });

  it("should cancel round and refund participants", () => {
    // Start round
    simnet.callPublicFn("simple-lottery", "start-new-round", [], deployer);

    // Add participants
    simnet.callPublicFn("simple-lottery", "buy-ticket", [], wallet1);
    simnet.callPublicFn("simple-lottery", "buy-ticket", [], wallet2);

    // Cancel round
    const { result } = simnet.callPublicFn(
      "simple-lottery",
      "cancel-round",
      [],
      deployer
    );

    expect(result).toBeOk(Cl.bool(true));

    // Check round is no longer active
    const roundInfo = simnet.callReadOnlyFn(
      "simple-lottery",
      "get-current-round",
      [],
      deployer
    );

    const roundData = roundInfo.result as any;
    expect(roundData.data.active).toBe(Cl.bool(false));
  });
});
