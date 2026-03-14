import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { HomeModule } from './home/home.module';
import { ProfileModule } from './profile/profile.module';
import { ExploreModule } from './explore/explore.module';
import { TopupModule } from './topup/topup.module';
import { DiscussModule } from './discuss/discuss.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config';
import { DashboardAuthModule } from './dashboard-auth/dashboard-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '1d' },
    }),
    HomeModule,
    ProfileModule,
    ExploreModule,
    TopupModule,
    DiscussModule,
    CloudinaryModule,
    DashboardAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
