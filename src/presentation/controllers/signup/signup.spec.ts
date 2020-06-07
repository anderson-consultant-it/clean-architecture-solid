import SignUpController from './signup';
import {
  MissingParamError,
  InvalidParamError,
  ServerError,
} from '../../errors';

import {
  IEmailValidator,
  IAccountModel,
  IAddAccount,
  IAddAccountModel,
} from './signup-protocols';

const makeEmailValidator = (): IEmailValidator => {
  class EmailValidatorStub implements IEmailValidator {
    isValid(email: string): boolean {
      return true;
    }
  }

  return new EmailValidatorStub();
};

const makeAddAccount = (): IAddAccount => {
  class AddAccountStub implements IAddAccount {
    async add(account: IAddAccountModel): Promise<IAccountModel> {
      const fakeAccount = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email@email.com',
        password: 'valid_password',
      };
      return new Promise(resolve => resolve(fakeAccount));
    }
  }
  return new AddAccountStub();
};

interface ISutTypes {
  sut: SignUpController;
  emailValidatorStub: IEmailValidator;
  addAccountStub: IAddAccount;
}

const makeSut = (): ISutTypes => {
  const emailValidatorStub = makeEmailValidator();
  const addAccountStub = makeAddAccount();
  const sut = new SignUpController(emailValidatorStub, addAccountStub);

  return {
    sut,
    emailValidatorStub,
    addAccountStub,
  };
};

describe('SignUp Controller', () => {
  test('Should return 400 if name is not provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'any@email.com',
        password: 'password',
        passwordConfirm: 'password',
      },
    };
    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('name'));
  });

  test('Should return 400 if email is not provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'name',
        password: 'password',
        passwordConfirm: 'password',
      },
    };
    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('email'));
  });

  test('Should return 400 if password is not provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'name',
        email: 'any@email.com',
        passwordConfirm: 'password',
      },
    };
    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('password'));
  });

  test('Should return 400 if passwordConfirm is not provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'name',
        email: 'any@email.com',
        password: 'password',
      },
    };
    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirm'));
  });

  test('Should return 400 if password confirmation fails', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'name',
        email: 'any@email.com',
        password: 'password',
        passwordConfirm: 'password2',
      },
    };
    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirm'));
  });

  test('Should return 400 if an invalid email is provided', async () => {
    const { sut, emailValidatorStub } = makeSut();

    // Forces the returned value to be equals to false for this specific test
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValue(false);

    const httpRequest = {
      body: {
        name: 'name',
        email: 'invalidemail@gmail.com',
        password: 'password',
        passwordConfirm: 'password',
      },
    };
    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError('email'));
  });

  test('Should call EmailValidator with correct email', async () => {
    const { sut, emailValidatorStub } = makeSut();

    // Forces the returned value to be equals to false for this specific test
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid');

    const httpRequest = {
      body: {
        name: 'name',
        email: 'any_email@gmail.com',
        password: 'password',
        passwordConfirm: 'password',
      },
    };
    sut.handle(httpRequest);
    expect(isValidSpy).toHaveBeenCalledWith('any_email@gmail.com');
  });

  test('Should return 500 if EmailValidator throws exception', async () => {
    const { sut, emailValidatorStub } = makeSut();

    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error();
    });

    const httpRequest = {
      body: {
        name: 'name',
        email: 'invalidemail@gmail.com',
        password: 'password',
        passwordConfirm: 'password',
      },
    };
    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test('Should call AddAccount with correct values', async () => {
    const { sut, addAccountStub } = makeSut();

    const addSpy = jest.spyOn(addAccountStub, 'add');

    const httpRequest = {
      body: {
        name: 'name',
        email: 'invalidemail@gmail.com',
        password: 'password',
        passwordConfirm: 'password',
      },
    };

    sut.handle(httpRequest);

    expect(addSpy).toHaveBeenCalledWith({
      name: 'name',
      email: 'invalidemail@gmail.com',
      password: 'password',
    });
  });

  test('Should return 500 if AddAccount throws exception', async () => {
    const { sut, addAccountStub } = makeSut();

    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(async () => {
      return new Promise((resolve, reject) => reject(new Error()));
    });

    const httpRequest = {
      body: {
        name: 'name',
        email: 'invalidemail@gmail.com',
        password: 'password',
        passwordConfirm: 'password',
      },
    };
    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut();

    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'valid_email@email.com',
        password: 'valid_password',
        passwordConfirm: 'valid_password',
      },
    };
    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(200);
    expect(httpResponse.body).toEqual({
      id: 'valid_id',
      name: 'valid_name',
      email: 'valid_email@email.com',
      password: 'valid_password',
    });
  });
});
