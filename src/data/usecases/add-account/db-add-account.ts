import {
  IAddAccount,
  IAddAccountModel,
} from '../../../domain/usecases/add-account';
import { IAccountModel } from '../../../domain/models/account';
import { IEncrypter } from '../../protocols/encrypter';

export class DBAddAccount implements IAddAccount {
  constructor(private readonly encrypter: IEncrypter) {}

  async add(account: IAddAccountModel): Promise<IAccountModel> {
    await this.encrypter.encrypt(account.password);
    return new Promise(resolve =>
      resolve({
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email',
        password: 'valid_password',
      }),
    );
  }
}
