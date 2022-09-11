import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Octokit } from 'octokit';
import { Response } from 'express';

@Injectable()
export class UserService {
    constructor(
        private configService: ConfigService,
        private readonly httpService: HttpService
    ) { }

    async GetGithubAuthToken(code: string, res: Response) {
        const gitHubClientId = this.configService.get<string>('GITHUB_OAUTH_CLIENT_ID');
        const gitHubClientSecret = this.configService.get<string>('GITHUB_OAUTH_CLIENT_SECRET');

        this.httpService.get(`https://github.com/login/oauth/access_token?client_id=${gitHubClientId}&client_secret=${gitHubClientSecret}&code=${code}`)
            .subscribe(async (response) => {
                const authToken = response.data.split('&')[0].split('=')[1];

                const octokit = new Octokit({
                    auth: authToken
                });

                const { login } = (await octokit.rest.users.getAuthenticated()).data;

                const repoName = `Dummy-Repo-${Math.random()}`;

                await octokit.rest.repos.createForAuthenticatedUser({
                    name: repoName
                });

                const fileContent = "VGhpcyBmaWxlIGlzIHB1c2hlZCB0byBnaXRodWIgdXNpbmcgb2N0b2tpdC4uLg==";

                await octokit.request(`PUT /repos/${login}/${repoName}/contents/file.txt`, {
                    owner: `${login}`,
                    repo: `${repoName}`,
                    path: 'file.txt',
                    message: 'new file by octocat',
                    committer: {
                        name: 'Octocat bot',
                        email: 'octocat@github.com'
                    },
                    content: `${fileContent}`
                });

                res.redirect(`${this.configService.get<string>('FRONTEND_URL')}/home`);
            });
    }
}
