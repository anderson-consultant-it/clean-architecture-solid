import SignUpController from './signup';

describe('SignUp Controller', () => {
  test('Should return 400 if name is not provided', () => {
    const sut = new SignUpController();
    const httpRequest = {
      body: {
        email: 'any@email.com',
        password: 'password',
        passwordConfirm: 'password',
      },
    };
    const httpResponse = sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new Error('Missing param: name'));
  });

  test('Should return 400 if email is not provided', () => {
    const sut = new SignUpController();
    const httpRequest = {
      body: {
        name: 'name',
        password: 'password',
        passwordConfirm: 'password',
      },
    };
    const httpResponse = sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new Error('Missing param: email'));
  });
});
