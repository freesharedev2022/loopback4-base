import {
  globalInterceptor,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
  Getter,
} from '@loopback/context';
import { inject } from '@loopback/core';
import { AuthenticationBindings, AuthenticationMetadata } from '@loopback/authentication';
import { RequiredPermissions, MyUserProfile } from '../types';

import { intersection } from 'lodash';
import { HttpErrors } from '@loopback/rest';

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@globalInterceptor('', { tags: { name: 'authorize' } })
export class AuthorizeInterceptor implements Provider<Interceptor> {
  constructor(
    @inject(AuthenticationBindings.METADATA)
    public metadata: AuthenticationMetadata,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public getCurrentUser: Getter<MyUserProfile>
  ) { }

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    // eslint-disable-next-line no-useless-catch
    try {
      // Add pre-invocation logic here
      if (!this.metadata) return next();
      const requiredPermissions = this.metadata.options as RequiredPermissions;
      const user = await this.getCurrentUser();
      const roles = [user.role]
      const results = intersection(roles, requiredPermissions.required).length;
      if (requiredPermissions.required && !results) {
        throw new HttpErrors.Forbidden('INVALID ACCESS PERMISSIONS')
      }
      const result = await next();
      return result;
    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }
}
