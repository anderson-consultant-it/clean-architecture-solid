import SignUpController from './signup';
import { MissingParamError, InvalidParamError, ServerError } from '../errors';

import { IEmailValidator } from '../protocols/email-validator';

interface ISutTypes {
  sut: SignUpController;
  emailValidatorStub: IEmailValidator;
}

const makeSut = (): ISutTypes => {
  class EmailValidatorStub implements IEmailValidator {
    isValid(email: string): boolean {
      return true;
    }
  }
  const emailValidatorStub = new EmailValidatorStub();
  const sut = new SignUpController(emailValidatorStub);

  return {
    sut,
    emailValidatorStub,
  };
};

describe('SignUp Controller', () => {
  test('Should return 400 if name is not provided', () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'any@email.com',
        password: 'password',
        passwordConfirm: 'password',
      },
    };
    const httpResponse = sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('name'));
  });

  test('Should return 400 if email is not provided', () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'name',
        password: 'password',
        passwordConfirm: 'password',
      },
    };
    const httpResponse = sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('email'));
  });

  test('Should return 400 if password is not provided', () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'name',
        email: 'any@email.com',
        passwordConfirm: 'password',
      },
    };
    const httpResponse = sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('password'));
  });

  test('Should return 400 if passwordConfirm is not provided', () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'name',
        email: 'any@email.com',
        password: 'password',
      },
    };
    const httpResponse = sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirm'));
  });

  test('Should return 400 if an invalid email is provided', () => {
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
    const httpResponse = sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError('email'));
  });

  test('Should call EmailValidator with correct email', () => {
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

  test('Should return 500 if EmailValidator throws exception', () => {
    class EmailValidatorStub implements IEmailValidator {
      isValid(email: string): boolean {
        throw new ServerError();
      }
    }

    const emailValidatorStub = new EmailValidatorStub();
    const sut = new SignUpController(emailValidatorStub);

    const httpRequest = {
      body: {
        name: 'name',
        email: 'invalidemail@gmail.com',
        password: 'password',
        passwordConfirm: 'password',
      },
    };
    const httpResponse = sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });
});
