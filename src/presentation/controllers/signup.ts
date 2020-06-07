import MissingParamError from '../errors/missing-param-error';
import { badRequest } from '../helpers/http-helper';
import { IController } from '../protocols/controller';
import { IHttpRequest, IHttpResponse } from '../protocols/http';

export default class SignUpController implements IController {
  handle(httpRequest: IHttpRequest): IHttpResponse {
    const requiredFields = ['name', 'email', 'password', 'passwordConfirm'];

    for (const field of requiredFields) {
      if (!httpRequest.body[field]) {
        return badRequest(new MissingParamError(field));
      }
    }

    return { statusCode: 200 };
  }
}
