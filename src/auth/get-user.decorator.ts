import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  // 굳이 커스텀 데코레이터를 만들어서 넣는 이유는 없지만, 한 번 만들어보기 위해.
  const req = ctx.switchToHttp().getRequest(); // 받아온 모든 요청이 여기에 들어가게 된다.
  return req.user;
});
