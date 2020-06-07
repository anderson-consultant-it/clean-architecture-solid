import { MissingParamError, InvalidParamError } from '../../errors';

import {
  IHttpRequest,
  IHttpResponse,
  IController,
  IEmailValidator,
  IAddAccount,
} from './signup-protocols';
import { badRequest, serverError, ok } from '../../helpers/http-helper';

export default class SignUpController implements IController {
  constructor(
    private readonly emailValidator: IEmailValidator,
    private addAccount: IAddAccount,
  ) {}

  async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    try {
      const requiredFields = ['name', 'email', 'password', 'passwordConfirm'];

      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field));
        }
      }

      const { name, email, password, passwordConfirm } = httpRequest.body;

      if (password !== passwordConfirm) {
        return badRequest(new InvalidParamError('passwordConfirm'));
      }

      const isValid = this.emailValidator.isValid(email);

      if (!isValid) {
        return badRequest(new InvalidParamError('email'));
      }

      const account = await this.addAccount.add({ name, email, password });

      return ok(account);

      return { statusCode: 200 };
    } catch (error) {
      return serverError();
    }
  }
}
