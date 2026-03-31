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
import { DashboardStatsModule } from './dashboard-stats/dashboard-stats.module';
import { DashboardUserStatsModule } from './dashboard-user-stats/dashboard-user-stats.module';
import { DashboardBooksModule } from './dashboard-books/dashboard-books.module';
import { BookOffersModule } from './book-offers/book-offers.module';
import { BookStatusModule } from './book-status/book-status.module';
import { DashboardBookRequestsModule } from './dashboard-book-requests/dashboard-book-requests.module';
import { BookReviewsModule } from './book-reviews/book-reviews.module';
import { BookRequestsModule } from './book-requests/book-requests.module';

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
    DashboardStatsModule,
    DashboardUserStatsModule,
    DashboardBooksModule,
    BookOffersModule,
    BookStatusModule,
    DashboardBookRequestsModule,
    BookReviewsModule,
    BookRequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
