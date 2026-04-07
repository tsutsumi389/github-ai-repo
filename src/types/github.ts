export type Repository = {
  readonly id: number;
  readonly name: string;
  readonly full_name: string;
  readonly html_url: string;
  readonly owner: {
    readonly login: string;
    readonly avatar_url: string;
  };
};
