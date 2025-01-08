import { SanitizerConstraint, Sanitize } from 'class-sanitizer';
import { IsString, IsMobilePhone, MinLength, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @Length(5, 25)
    name: string;

    @Sanitize((value) => value.trim())
    @IsMobilePhone('en-IN')
    @IsNotEmpty()
    mobile: string;

    @Sanitize((value) => value.trim())
    @IsNotEmpty()
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        {
            message:
                'Password must be at least 6 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character (@, $, !, %, *, ?, &)',
        },
    )
    password: string;
}
