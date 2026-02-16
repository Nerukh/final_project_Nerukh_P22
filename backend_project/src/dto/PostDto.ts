import { IsString, IsNumber, IsOptional, MinLength } from 'class-validator';

export class PostDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @MinLength(1)
    text!: string;

    @IsString()
    @IsOptional()
    image?: string;

    @IsNumber()
    @IsOptional()
    latitude?: number;

    @IsNumber()
    @IsOptional()
    longitude?: number;

    @IsString()
    @IsOptional()
    date?: string;

    @IsString()
    @IsOptional()
    user_email?: string;

}