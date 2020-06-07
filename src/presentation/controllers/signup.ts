import { MissingParamError, InvalidParamError } from '../errors';

import {
  IHttpRequest,
  IHttpResponse,
  IController,
  IEmailValidator,
} from '../protocols';
import { badRequest, serverError } from '../helpers/http-helper';

export default class SignUpController implements IController {
  constructor(private readonly emailValidator: IEmailValidator) {}

  handle(httpRequest: IHttpRequest): IHttpResponse {
    try {
      const requiredFields = ['name', 'email', 'password', 'passwordConfirm'];

      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field));
        }
      }

      const { email, password, passwordConfirm } = httpRequest.body;

      if (password !== passwordConfirm) {
        return badRequest(new InvalidParamError('passwordConfirm'));
      }

      const isValid = this.emailValidator.isValid(email);

      if (!isValid) {
        return badRequest(new InvalidParamError('email'));
      }

      return { statusCode: 200 };
    } catch (error) {
      return serverError();
    }
  }
}
