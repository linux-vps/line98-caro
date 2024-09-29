import { BadRequestException, forwardRef, Inject, Injectable, RequestTimeoutException } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/providers/auth.service';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

@Injectable()
export class CreateUserProvider {

    constructor(

        // Injecting Config Service
        private readonly configService: ConfigService,
    
        // Injeacting usersRespository
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        // Injecting HashsingProvider
        @Inject(forwardRef(() => HashingProvider))
        private readonly hashingProvider: HashingProvider,
    
        // Injeacting Auth Service
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
      ) {}

    async createUser(createUserDto: CreateUserDto) {

        let existingUser = undefined;
        
        try {
          existingUser = await this.usersRepository.findOne({
            where: {
              username: createUserDto.username,
            },
          });
        } catch (error) {
          console.log('Error connecting to the database', error);
          throw new RequestTimeoutException(
            'Unable to proccess your request at the moment, please try agnain later',
            {
              description: 'Error connecting to the database',
            });
        }
    
        // Handle exception
        if (existingUser) {
          throw new BadRequestException(
            `User with username ${createUserDto.username} already exists, please check your username`, 
          )}
        let newUser = this.usersRepository.create({
            ...createUserDto,
            password: await this.hashingProvider.hashPassword(createUserDto.password)
        });

        try {
          newUser = await this.usersRepository.save(newUser);
        } catch (error) {
          console.log('Error connecting to the database', error);
          throw new RequestTimeoutException(
            'Unable to proccess your request at the moment, please try agnain later',
            {
              description: 'Error connecting to the database',
            });
        }
    
    
        return newUser;
      }
    
}
