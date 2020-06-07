import SignUpController from './signup';
import MissingParamError from '../errors/missing-param-error';

const makeSut = (): SignUpController => {
  return new SignUpController();
};

describe('SignUp Controller', () => {
  test('Should return 400 if name is not provided', () => {
    const sut = makeSut();
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
    const sut = makeSut();
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
    const sut = makeSut();
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
    const sut = makeSut();
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
});
