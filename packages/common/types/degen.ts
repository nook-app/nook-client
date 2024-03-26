export type IndividualTipAllowance = {
  snapshot_date: string;
  user_rank: string;
  wallet_address: string;
  avatar_url: string;
  display_name: string;
  tip_allowance: string;
  remaining_allowance: string;
};

export type TipAllowanceResponse = IndividualTipAllowance[];

export type TipAllowance = {
  fid: string;
  user_rank: string;
  avatar_url: string;
  display_name: string;
  reactions_per_cast: string;
  tip_allowance: string;
};

export type AllTipAllowancesResponse = TipAllowance[];

export type DegenTipAllowance = {
  remaining: bigint;
  total: bigint;
};
