import { CreateUserDto } from './../dtos/create-user.dto';
import { DataSource, Repository } from 'typeorm';
import { GetUsersParamDto } from '../dtos/get-users-param.dto';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  RequestTimeoutException,
  forwardRef,
} from '@nestjs/common';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService, ConfigType } from '@nestjs/config';
import { UsersCreateManyProvider } from './users-create-many.provider';
import { CreateManyUsersDto } from '../dtos/create-many-users.dto';
import { CreateUserProvider } from './create-user.provider';
import { FindOneUserByUsernameProvider } from './find-one-user-by-username.provider';
import { PatchUserDto } from '../dtos/patch-user.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { HashingProvider } from 'src/auth/providers/hashing.provider';

/**
 * Controller class for '/users' API endpoint
 */
@Injectable()
export class UsersService {
  constructor(
    /**
     * Injecting usersRepository
     */
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    /**
     * Inject UsersCreateMany provider
     */
    private readonly usersCreateManyProvider: UsersCreateManyProvider,
    /**
     * Inject Create Users Provider
     */
    private readonly createUserProvider: CreateUserProvider,

    /**
     * Inject FindOneUserByUsernameProvider
     */
    private readonly findOneUserByUsernameProvider: FindOneUserByUsernameProvider,

    /**
     * Inject Hashing Provider
     */
    private readonly hashingProvider: HashingProvider,
  ) {}

  /**
   * Method to create a new user
   */
  public async createUser(createUserDto: CreateUserDto) {
    return await this.createUserProvider.createUser(createUserDto);
  }

  /**
   * Public method responsible for handling GET request for '/users' endpoint
   */
  public findAll(
    getUserParamDto: GetUsersParamDto,
    limt: number,
    page: number,
  ) {
    throw new HttpException(
      {
        status: HttpStatus.MOVED_PERMANENTLY,
        error: 'The API endpoint does not exist',
        fileName: 'users.service.ts',
        lineNumber: 88,
      },
      HttpStatus.MOVED_PERMANENTLY,
      {
        cause: new Error(),
        description: 'Occured because the API endpoint was permanently moved',
      },
    );
  }

  /**
   * Public method used to find one user using the ID of the user
   */
  public async findOneById(id: number) {
    let user = undefined;

    try {
      user = await this.usersRepository.findOneBy({
        id,
      });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment please try later',
        {
          description: 'Error connecting to the the datbase',
        },
      );
    }

    /**
     * Handle the user does not exist
     */
    if (!user) {
      throw new BadRequestException('The user id does not exist');
    }

    return user;
  }

  public async createMany(createManyUsersDto: CreateManyUsersDto) {
    return await this.usersCreateManyProvider.createMany(createManyUsersDto);
  }

  // Finds one user by username
  public async findOneByUsername(username: string) {
    return await this.findOneUserByUsernameProvider.findOneByUsername(username);
  }

  public async updateUser(id: number, patchUserDto: PatchUserDto) {
    const user = await this.findOneById(id);
    
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    Object.assign(user, patchUserDto);

    try {
      await this.usersRepository.save(user);
      return user;
    } catch (error) {
      throw new BadRequestException('Không thể cập nhật người dùng');
    }
  }
  public async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.findOneById(id);
    
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    const isPasswordValid = await this.hashingProvider.comparePassword(
      changePasswordDto.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    user.password = await this.hashingProvider.hashPassword(changePasswordDto.newPassword);

    try {
      await this.usersRepository.save(user);
      return { message: 'Mật khẩu đã được thay đổi thành công' };
    } catch (error) {
      throw new BadRequestException('Không thể thay đổi mật khẩu');
    }
  }
}
