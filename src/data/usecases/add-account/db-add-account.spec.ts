import { DBAddAccount } from './db-add-account';
import { IEncrypter } from '../../protocols/encrypter';

interface SutTypes {
  sut: DBAddAccount;
  encrypterStub: IEncrypter;
}

const makeEncrypter = (): IEncrypter => {
  class EncrypterStub implements IEncrypter {
    async encrypt(value: string): Promise<string> {
      return new Promise(resolve => resolve('hashed_password'));
    }
  }

  return new EncrypterStub();
};

const makeSut = (): SutTypes => {
  const encrypterStub = makeEncrypter();

  const sut = new DBAddAccount(encrypterStub);

  return { sut, encrypterStub };
};

describe('DBAddAccount UseCase', () => {
  test('Should call Encrypter with correct password', async () => {
    const { sut, encrypterStub } = makeSut();

    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt');

    const accountData = {
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password',
    };

    await sut.add(accountData);

    expect(encryptSpy).toHaveBeenCalledWith(accountData.password);
  });
});
