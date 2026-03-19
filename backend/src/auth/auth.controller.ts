import { Controller, Post, Body, Get, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @Public()
    async login(@Body() body: any) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Post('register')
    @Public()
    async register(@Body() body: any) {
        return this.authService.register(body);
    }

    @Post('register-admin')
    @Public()
    async registerAdmin(@Body() body: any) {
        return this.authService.registerAdmin(body);
    }

    @Get('profile')
    getProfile(@Request() req: any) {
        return req.user;
    }
}
