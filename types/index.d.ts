// TypeScript Version: 2.9

/// <reference types="node" />

import { AxiosInstance } from "axios";
import { AssetType, Asset, Memo, MemoType, Transaction } from 'zion-base';

// Re-StellarBase
export {
  Account,
  Asset,
  AssetType,
  AuthFlag,
  AuthImmutableFlag,
  AuthRequiredFlag,
  AuthRevocableFlag,
  FastSigning,
  Keypair,
  Memo,
  MemoType,
  MemoValue,
  MemoHash,
  MemoID,
  MemoNone,
  MemoReturn,
  MemoText,
  Network,
  Networks,
  Operation,
  OperationOptions,
  OperationType,
  StrKey,
  Signer,
  SignerOptions,
  TimeoutInfinite,
  Transaction,
  TransactionBuilder,
  hash,
  sign,
  verify,
  xdr
} from 'zion-base';

// Shorthands, not-to-export.
export {};
type Key = string | number | symbol;
type Diff<T extends Key, U extends Key> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T];
type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

export class NetworkError extends Error {
  private response: any;
  constructor(message: string, response: any);
  getResponse(): any;
}
export class NotFoundError extends NetworkError {}
export class BadRequestError extends NetworkError {}
export class BadResponseError extends NetworkError {}

export namespace Config {
  function setAllowHttp(allow: boolean): void;
  function isAllowHttp(): boolean;
  function setDefault(): void;
}

interface Timebounds {
  minTime: number;
  maxTime: number;
}

export class Server {
  constructor(serverURL: string, options?: Server.Options);
  accounts(): Server.AccountCallBuilder;
  assets(): Server.AssetsCallBuilder;
  effects(): Server.EffectCallBuilder;
  ledgers(): Server.LedgerCallBuilder;
  loadAccount(accountId: string): Promise<Server.AccountResponse>;
  offers(resource: string, ...parameters: string[]): Server.OfferCallBuilder;
  operations(): Server.OperationCallBuilder;
  orderbook(selling: Asset, buying: Asset): Server.OrderbookCallBuilder;
  paths(
    source: string,
    destination: string,
    destinationAsset: Asset,
    destinationAmount: string
  ): Server.PathCallBuilder;
  payments(): Server.PaymentCallBuilder;
  submitTransaction(
    transaction: Transaction
  ): Promise<Server.TransactionRecord>;
  tradeAggregation(
    base: Asset,
    counter: Asset,
    startTime: Date,
    endTime: Date,
    resolution: Date
  ): Server.TradeAggregationCallBuilder;
  trades(): Server.TradesCallBuilder;
  transactions(): Server.TransactionCallBuilder;

  fetchBaseFee(): Promise<number>;
  fetchTimebounds(seconds: number): Promise<Timebounds>;
  operationFeeStats(): Promise<Equator.OperationFeeStatsResponse>;

  serverURL: any; // TODO: require("urijs")
}

type CallBuilderResponse = Equator.BaseResponse | Server.CollectionPage;

export namespace Server {
  abstract class CallBuilder<
    FetchResponse extends CallBuilderResponse,
    StreamResponse extends CallBuilderResponse = FetchResponse
  > {
    constructor(serverUrl: string);
    call(): Promise<FetchResponse>;
    cursor(cursor: string): this;
    limit(limit: number | string): this;
    order(direction: 'asc' | 'desc'): this;
    stream(options?: {
      onmessage?: (record: StreamResponse) => void;
      onerror?: (error: Error) => void;
    }): () => void;
  }

  interface CollectionPage<
    T extends Equator.BaseResponse = Equator.BaseResponse
  > {
    records: T[];
    next: () => Promise<CollectionPage<T>>;
    prev: () => Promise<CollectionPage<T>>;
  }

  /* Due to a bug with the recursive function requests */
  interface CollectionRecord<
    T extends Equator.BaseResponse = Equator.BaseResponse
  > {
    _links: {
      next: Equator.ResponseLink;
      prev: Equator.ResponseLink;
      self: Equator.ResponseLink;
    };
    _embedded: {
      records: T[];
    };
  }

  interface CallFunctionTemplateOptions {
    cursor?: string | number;
    limit?: number;
    order?: 'asc' | 'desc';
  }

  type CallFunction<
    T extends Equator.BaseResponse = Equator.BaseResponse
  > = () => Promise<T>;
  type CallCollectionFunction<
    T extends Equator.BaseResponse = Equator.BaseResponse
  > = (options?: CallFunctionTemplateOptions) => Promise<CollectionRecord<T>>;

  interface AccountRecord extends Equator.BaseResponse {
    id: string;
    paging_token: string;
    account_id: string;
    sequence: number;
    subentry_count: number;
    inflation_destination?: string;
    last_modified_ledger: number;
    thresholds: Equator.AccountThresholds;
    flags: Equator.Flags;
    balances: Equator.BalanceLine[];
    signers: Array<{
      key: string;
      weight: number;
      type: string;
    }>;
    data: (options: { value: string }) => Promise<{ value: string }>;
    data_attr: {
      [key: string]: string;
    };
    effects: CallCollectionFunction<EffectRecord>;
    offers: CallCollectionFunction<OfferRecord>;
    operations: CallCollectionFunction<OperationRecord>;
    payments: CallCollectionFunction<PaymentOperationRecord>;
    trades: CallCollectionFunction<TradeRecord>;
  }

  interface AssetRecord extends Equator.BaseResponse {
    asset_type: AssetType.credit4 | AssetType.credit12;
    asset_code: string;
    asset_issuer: string;
    paging_token: string;
    amount: string;
    num_accounts: number;
    flags: Equator.Flags;
  }

  interface EffectRecord extends Equator.BaseResponse {
    account: string;
    paging_token: string;
    starting_balance: string;
    type_i: string;
    type: string;
    amount?: any;

    operation?: CallFunction<OperationRecord>;
    precedes?: CallFunction<EffectRecord>;
    succeeds?: CallFunction<EffectRecord>;
  }

  interface LedgerRecord extends Equator.BaseResponse {
    id: string;
    paging_token: string;
    hash: string;
    prev_hash: string;
    sequence: number;
    transaction_count: number;
    operation_count: number;
    closed_at: string;
    total_coins: string;
    fee_pool: string;
    base_fee: number;
    base_reserve: string;
    max_tx_set_size: number;
    protocol_version: number;
    header_xdr: string;
    base_fee_in_stroops: number;
    base_reserve_in_stroops: number;

    effects: CallCollectionFunction<EffectRecord>;
    operations: CallCollectionFunction<OperationRecord>;
    self: CallFunction<LedgerRecord>;
    transactions: CallCollectionFunction<TransactionRecord>;
  }

  interface OfferAsset {
    asset_type: AssetType;
    asset_code?: string;
    asset_issuer?: string;
  }

  interface OfferRecord extends Equator.BaseResponse {
    id: string;
    paging_token: string;
    seller: string;
    selling: OfferAsset;
    buying: OfferAsset;
    amount: string;
    price_r: Equator.PriceRShorthand;
    price: string;
    last_modified_ledger: number;
    last_modified_time: string;
  }

  import OperationResponseType = Equator.OperationResponseType;
  import OperationResponseTypeI = Equator.OperationResponseTypeI;
  interface BaseOperationRecord<
    T extends OperationResponseType = OperationResponseType,
    TI extends OperationResponseTypeI = OperationResponseTypeI
  > extends Equator.BaseOperationResponse<T, TI> {
    self: CallFunction<OperationRecord>;
    succeeds: CallFunction<OperationRecord>;
    precedes: CallFunction<OperationRecord>;
    effects: CallCollectionFunction<EffectRecord>;
    transaction: CallFunction<TransactionRecord>;
  }

  interface CreateAccountOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.createAccount,
        OperationResponseTypeI.createAccount
      >,
      Equator.CreateAccountOperationResponse {}
  interface PaymentOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.payment,
        OperationResponseTypeI.payment
      >,
      Equator.PaymentOperationResponse {
    sender: CallFunction<AccountRecord>;
    receiver: CallFunction<AccountRecord>;
  }
  interface PathPaymentOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.pathPayment,
        OperationResponseTypeI.pathPayment
      >,
      Equator.PathPaymentOperationResponse {}
  interface ManageOfferOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.manageOffer,
        OperationResponseTypeI.manageOffer
      >,
      Equator.ManageOfferOperationResponse {}
  interface PassiveOfferOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.createPassiveOffer,
        OperationResponseTypeI.createPassiveOffer
      >,
      Equator.PassiveOfferOperationResponse {}
  interface SetOptionsOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.setOptions,
        OperationResponseTypeI.setOptions
      >,
      Equator.SetOptionsOperationResponse {}
  interface ChangeTrustOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.changeTrust,
        OperationResponseTypeI.changeTrust
      >,
      Equator.ChangeTrustOperationResponse {}
  interface AllowTrustOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.allowTrust,
        OperationResponseTypeI.allowTrust
      >,
      Equator.AllowTrustOperationResponse {}
  interface AccountMergeOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.accountMerge,
        OperationResponseTypeI.accountMerge
      >,
      Equator.AccountMergeOperationResponse {}
  interface InflationOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.inflation,
        OperationResponseTypeI.inflation
      >,
      Equator.InflationOperationResponse {}
  interface ManageDataOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.manageData,
        OperationResponseTypeI.manageData
      >,
      Equator.ManageDataOperationResponse {}
  interface BumpSequenceOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.bumpSequence,
        OperationResponseTypeI.bumpSequence
      >,
      Equator.BumpSequenceOperationResponse {}

  type OperationRecord =
    | CreateAccountOperationRecord
    | PaymentOperationRecord
    | PathPaymentOperationRecord
    | ManageOfferOperationRecord
    | PassiveOfferOperationRecord
    | SetOptionsOperationRecord
    | ChangeTrustOperationRecord
    | AllowTrustOperationRecord
    | AccountMergeOperationRecord
    | InflationOperationRecord
    | ManageDataOperationRecord
    | BumpSequenceOperationRecord;

  interface OrderbookRecord extends Equator.BaseResponse {
    bids: Array<{ price_r: {}; price: number; amount: string }>;
    asks: Array<{ price_r: {}; price: number; amount: string }>;
    selling: Asset;
    buying: Asset;
  }

  interface PaymentPathRecord extends Equator.BaseResponse {
    path: Array<{
      asset_code: string;
      asset_issuer: string;
      asset_type: string;
    }>;
    source_amount: string;
    source_asset_type: string;
    source_asset_code: string;
    source_asset_issuer: string;
    destination_amount: string;
    destination_asset_type: string;
    destination_asset_code: string;
    destination_asset_issuer: string;
  }

  interface TradeRecord extends Equator.BaseResponse {
    id: string;
    paging_token: string;
    ledger_close_time: string;
    offer_id: string;
    base_offer_id: string;
    base_account: string;
    base_amount: string;
    base_asset_type: string;
    base_asset_code?: string;
    base_asset_issuer?: string;
    counter_offer_id: string;
    counter_account: string;
    counter_amount: string;
    counter_asset_type: string;
    counter_asset_code?: string;
    counter_asset_issuer?: string;
    base_is_seller: boolean;

    base: CallFunction<AccountRecord>;
    counter: CallFunction<AccountRecord>;
    operation: CallFunction<OperationRecord>;
  }

  interface TradeAggregationRecord extends Equator.BaseResponse {
    timestamp: string;
    trade_count: number;
    base_volume: string;
    counter_volume: string;
    avg: string;
    high: string;
    low: string;
    open: string;
    close: string;
  }

  interface TransactionRecord
    extends Omit<Equator.TransactionResponse, 'ledger'> {
    ledger_attr: Equator.TransactionResponse['ledger'];

    account: CallFunction<AccountRecord>;
    effects: CallCollectionFunction<EffectRecord>;
    ledger: CallFunction<LedgerRecord>;
    operations: CallCollectionFunction<OperationRecord>;
    precedes: CallFunction<TransactionRecord>;
    self: CallFunction<TransactionRecord>;
    succeeds: CallFunction<TransactionRecord>;
  }

  abstract class AccountCallBuilder extends CallBuilder<AccountRecord> {
    accountId(id: string): this;
  }
  class AccountResponse implements AccountRecord {
    _links: { [key in 'self']: Equator.ResponseLink };
    id: string;
    paging_token: string;
    account_id: string;
    sequence: number;
    subentry_count: number;
    thresholds: Equator.AccountThresholds;
    flags: Equator.Flags;
    balances: Equator.BalanceLine[];
    signers: Equator.AccountSigner[];
    data: (options: { value: string }) => Promise<{ value: string }>;
    data_attr: {
      [key: string]: string;
    };
    inflation_destination?: any;
    last_modified_ledger: number;

    effects: CallCollectionFunction<EffectRecord>;
    offers: CallCollectionFunction<OfferRecord>;
    operations: CallCollectionFunction<OperationRecord>;
    payments: CallCollectionFunction<PaymentOperationRecord>;
    trades: CallCollectionFunction<TradeRecord>;
    constructor(response: AccountRecord);
    accountId(): string;
    sequenceNumber(): string;
    incrementSequenceNumber(): void;
  }

  abstract class AssetsCallBuilder extends CallBuilder<
    CollectionPage<AssetRecord>,
    AssetRecord
  > {
    forCode(value: string): this;
    forIssuer(value: string): this;
  }

  abstract class EffectCallBuilder extends CallBuilder<
    CollectionPage<EffectRecord>,
    EffectRecord
  > {
    forAccount(accountId: string): this;
    forLedger(sequence: string | number): this;
    forOperation(operationId: number): this;
    forTransaction(transactionId: string): this;
  }

  abstract class LedgerCallBuilder extends CallBuilder<
    CollectionPage<LedgerRecord>,
    LedgerRecord
  > {
    ledger(sequence: string | number): this;
  }

  abstract class OfferCallBuilder extends CallBuilder<
    CollectionPage<OfferRecord>,
    OfferRecord
  > {}

  abstract class OperationCallBuilder extends CallBuilder<
    CollectionPage<OperationRecord>,
    OperationRecord
  > {
    forAccount(accountId: string): this;
    forLedger(sequence: string | number): this;
    forTransaction(transactionId: string): this;
    includeFailed(value: boolean): this;
    operation(operationId: number): this;
  }
  abstract class OrderbookCallBuilder extends CallBuilder<OrderbookRecord> {}
  abstract class PathCallBuilder extends CallBuilder<
    CollectionPage<PaymentPathRecord>,
    PaymentPathRecord
  > {}
  abstract class PaymentCallBuilder extends CallBuilder<
    CollectionPage<PaymentOperationRecord>,
    PaymentOperationRecord
  > {
    forAccount(accountId: string): this;
    forLedger(sequence: string | number): this;
    forTransaction(transactionId: string): this;
  }

  interface Options {
    allowHttp: boolean;
  }

  abstract class TradeAggregationCallBuilder extends CallBuilder<
    CollectionPage<TradeAggregationRecord>,
    TradeAggregationRecord
  > {}
  abstract class TradesCallBuilder extends CallBuilder<
    CollectionPage<TradeRecord>,
    TradeRecord
  > {
    forAssetPair(base: Asset, counter: Asset): this;
    forOffer(offerId: string): this;
    forAccount(accountId: string): this;
  }

  abstract class TransactionCallBuilder extends CallBuilder<
    CollectionPage<TransactionRecord>,
    TransactionRecord
  > {
    transaction(transactionId: string): this;
    forAccount(accountId: string): this;
    forLedger(sequence: string | number): this;
    includeFailed(value: boolean): this;
  }
}

export class FederationServer {
  static createForDomain(
    domain: string,
    options?: FederationServer.Options
  ): Promise<FederationServer>;
  static resolve(
    value: string,
    options?: FederationServer.Options
  ): Promise<FederationServer.Record>;

  constructor(
    serverURL: string,
    domain: string,
    options?: FederationServer.Options
  );
  resolveAccountId(account: string): Promise<FederationServer.Record>;
  resolveAddress(address: string): Promise<FederationServer.Record>;
  resolveTransactionId(transactionId: string): Promise<FederationServer.Record>;
}
export namespace FederationServer {
  interface Record {
    account_id: string;
    memo_type?: string;
    memo?: string;
  }

  interface Options {
    allowHttp: boolean;
  }
}

export namespace StellarTomlResolver {
  interface StellarTomlResolveOptions {
    allowHttp?: boolean;
    timeout?: number;
  }

  function resolve(
    domain: string,
    options?: StellarTomlResolveOptions
  ): Promise<{ [key: string]: any }>;
}

export namespace Equator {
  interface ResponseLink {
    href: string;
    templated?: boolean;
  }
  interface BaseResponse<T extends string = never> {
    _links: { [key in T | 'self']: ResponseLink };
  }
  interface TransactionResponse
    extends BaseResponse<
      'account' | 'ledger' | 'operations' | 'effects' | 'succeeds' | 'precedes'
    > {
    created_at: string;
    envelope_xdr: string;
    fee_meta_xdr: string;
    fee_paid: number;
    hash: string;
    id: string;
    ledger: number;
    memo_type: MemoType;
    memo?: string;
    operation_count: number;
    paging_token: string;
    result_meta_xdr: string;
    result_xdr: string;
    signatures: string[];
    source_account: string;
    source_account_sequence: string;
  }

  interface BalanceLineNative {
    balance: string;
    asset_type: AssetType.native;
    buying_liabilities: string;
    selling_liabilities: string;
  }
  interface BalanceLineAsset<
    T extends AssetType.credit4 | AssetType.credit12 =
      | AssetType.credit4
      | AssetType.credit12
  > {
    balance: string;
    limit: string;
    asset_type: T;
    asset_code: string;
    asset_issuer: string;
    buying_liabilities: string;
    selling_liabilities: string;
    last_modified_ledger: number;
  }
  type BalanceLine<T extends AssetType = AssetType> = T extends AssetType.native
    ? BalanceLineNative
    : T extends AssetType.credit4 | AssetType.credit12
    ? BalanceLineAsset<T>
    : BalanceLineNative | BalanceLineAsset;

  interface PriceR {
    numerator: number;
    denominator: number;
  }

  interface PriceRShorthand {
    n: number;
    d: number;
  }

  interface AccountThresholds {
    low_threshold: number;
    med_threshold: number;
    high_threshold: number;
  }
  interface Flags {
    auth_immutable: boolean;
    auth_required: boolean;
    auth_revocable: boolean;
  }
  interface AccountSigner {
    key: string;
    weight: number;
    type: string;
  }
  interface AccountResponse
    extends BaseResponse<
      | 'transactions'
      | 'operations'
      | 'payments'
      | 'effects'
      | 'offers'
      | 'trades'
      | 'data'
    > {
    id: string;
    paging_token: string;
    account_id: string;
    sequence: string;
    subentry_count: number;
    thresholds: AccountThresholds;
    flags: Flags;
    balances: BalanceLine[];
    signers: AccountSigner[];
    data: {
      [key: string]: string;
    };
  }

  enum OperationResponseType {
    createAccount = 'create_account',
    payment = 'payment',
    pathPayment = 'path_payment',
    createPassiveOffer = 'create_passive_offer',
    manageOffer = 'manage_offer',
    setOptions = 'set_options',
    changeTrust = 'change_trust',
    allowTrust = 'allow_trust',
    accountMerge = 'account_merge',
    inflation = 'inflation',
    manageData = 'manage_data',
    bumpSequence = 'bump_sequence'
  }
  enum OperationResponseTypeI {
    createAccount = 0,
    payment = 1,
    pathPayment = 2,
    createPassiveOffer = 3,
    manageOffer = 4,
    setOptions = 5,
    changeTrust = 6,
    allowTrust = 7,
    accountMerge = 8,
    inflation = 9,
    manageData = 10,
    bumpSequence = 11
  }
  interface BaseOperationResponse<
    T extends OperationResponseType = OperationResponseType,
    TI extends OperationResponseTypeI = OperationResponseTypeI
  > extends BaseResponse<'succeeds' | 'precedes' | 'effects' | 'transaction'> {
    id: string;
    paging_token: string;
    source_account: string;
    type: T;
    type_i: TI;
    created_at: string;
    transaction_hash: string;
  }
  interface CreateAccountOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.createAccount,
      OperationResponseTypeI.createAccount
    > {
    account: string;
    funder: string;
    starting_balance: string;
  }
  interface PaymentOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.payment,
      OperationResponseTypeI.payment
    > {
    from: string;
    to: string;
    asset_type: AssetType;
    asset_code?: string;
    asset_issuer?: string;
    amount: string;
  }
  interface PathPaymentOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.pathPayment,
      OperationResponseTypeI.pathPayment
    > {
    from: string;
    to: string;
    asset_type: AssetType;
    asset_code?: string;
    asset_issuer?: string;
    amount: string;
    source_asset_type: AssetType;
    source_asset_code?: string;
    source_asset_issuer?: string;
    source_max: string;
    source_amount: string;
  }
  interface ManageOfferOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.manageOffer,
      OperationResponseTypeI.manageOffer
    > {
    offer_id: number;
    amount: string;
    buying_asset_type: AssetType;
    buying_asset_code?: string;
    buying_asset_issuer?: string;
    price: string;
    price_r: PriceR;
    selling_asset_type: AssetType;
    selling_asset_code?: string;
    selling_asset_issuer?: string;
  }
  interface PassiveOfferOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.createPassiveOffer,
      OperationResponseTypeI.createPassiveOffer
    > {
    offer_id: number;
    amount: string;
    buying_asset_type: AssetType;
    buying_asset_code?: string;
    buying_asset_issuer?: string;
    price: string;
    price_r: PriceR;
    selling_asset_type: AssetType;
    selling_asset_code?: string;
    selling_asset_issuer?: string;
  }
  interface SetOptionsOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.setOptions,
      OperationResponseTypeI.setOptions
    > {
    signer_key?: string;
    signer_weight?: number;
    master_key_weight?: number;
    low_threshold?: number;
    med_threshold?: number;
    high_threshold?: number;
    home_domain?: string;
    set_flags: Array<1 | 2>;
    set_flags_s: Array<'auth_required_flag' | 'auth_revocable_flag'>;
    clear_flags: Array<1 | 2>;
    clear_flags_s: Array<'auth_required_flag' | 'auth_revocable_flag'>;
  }
  interface ChangeTrustOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.changeTrust,
      OperationResponseTypeI.changeTrust
    > {
    asset_type: AssetType.credit4 | AssetType.credit12;
    asset_code: string;
    asset_issuer: string;
    trustee: string;
    trustor: string;
    limit: string;
  }
  interface AllowTrustOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.allowTrust,
      OperationResponseTypeI.allowTrust
    > {
    asset_type: AssetType;
    asset_code: string;
    asset_issuer: string;
    authorize: boolean;
    trustee: string;
    trustor: string;
  }
  interface AccountMergeOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.accountMerge,
      OperationResponseTypeI.accountMerge
    > {
    into: string;
  }
  interface InflationOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.inflation,
      OperationResponseTypeI.inflation
    > {}
  interface ManageDataOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.manageData,
      OperationResponseTypeI.manageData
    > {
    name: string;
    value: Buffer;
  }
  interface BumpSequenceOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.bumpSequence,
      OperationResponseTypeI.bumpSequence
    > {
    bump_to: string;
  }

  interface ResponseCollection<T extends BaseResponse = BaseResponse> {
    _links: {
      self: ResponseLink;
      next: ResponseLink;
      prev: ResponseLink;
    };
    _embedded: {
      records: T[];
    };
  }
  interface TransactionResponseCollection
    extends ResponseCollection<TransactionResponse> {}

  interface OperationFeeStatsResponse {
    last_ledger: string;
    last_ledger_base_fee: string;
    ledger_capacity_usage: string;
    min_accepted_fee: string;
    mode_accepted_fee: string;
    p10_accepted_fee: string;
    p20_accepted_fee: string;
    p30_accepted_fee: string;
    p40_accepted_fee: string;
    p50_accepted_fee: string;
    p60_accepted_fee: string;
    p70_accepted_fee: string;
    p80_accepted_fee: string;
    p90_accepted_fee: string;
    p95_accepted_fee: string;
    p99_accepted_fee: string;
  }
}

export const HorizonAxiosClient: AxiosInstance;
