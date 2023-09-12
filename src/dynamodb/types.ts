import { User } from '../models/types';

export type DbBase = {
  $pk: string;
  $sk: string;
  $schema: string;
  $lastUpdated: string;
  $created: string;
};

export type DbUser = DbBase & User;
