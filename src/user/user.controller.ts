import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';

@Controller('/api/user')
export class UserController {
    constructor(private readonly userService: UserService, private configService: ConfigService) { }

    @Get('/github-oauth')
    auth(@Req() req: Request, @Res() res: Response) {
        this.userService.GetGithubAuthToken(req.query.code.toString(), res);
        console.log('this')

    }
}
