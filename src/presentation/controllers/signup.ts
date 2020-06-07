import MissingParamError from '../errors/missing-param-error';
import InvalidParamError from '../errors/invalid-param-error';

import { IHttpRequest, IHttpResponse } from '../protocols/http';
import { badRequest } from '../helpers/http-helper';
import { IController } from '../protocols/controller';
import { IEmailValidator } from '../protocols/email-validator';

export default class SignUpController implements IController {
  constructor(private readonly emailValidator: IEmailValidator) {}

  handle(httpRequest: IHttpRequest): IHttpResponse {
    const requiredFields = ['name', 'email', 'password', 'passwordConfirm'];

    for (const field of requiredFields) {
      if (!httpRequest.body[field]) {
        return badRequest(new MissingParamError(field));
      }
    }

    const isValid = this.emailValidator.isValid(httpRequest.body.email);

    if (!isValid) {
      return badRequest(new InvalidParamError('email'));
    }

    return { statusCode: 200 };
  }
}
