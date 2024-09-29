import { Controller, Get, Headers, HttpStatus, Req, Res } from '@nestjs/common';
import { TokensService } from './providers/tokens.service';
import { Request, Response } from 'express'; 

@Controller('tokens')
export class TokensController {
    constructor(private readonly tokensService: TokensService) {}

    @Get('access-token')
    async getAccessToken( 
        @Req() req: Request, 
        @Res() res: Response,
    ) {
        try {
            let tokens = await this.tokensService.refreshTokens();
            const accessToken = await this.tokensService.getAccessToken();
            return res.send(accessToken);
        } catch (error) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                message: 'Không thể làm mới token',
                error: error.message, 
            });
        }
    }
}