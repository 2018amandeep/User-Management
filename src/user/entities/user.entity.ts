import { IsMobilePhone, MinLength } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })  // if mobile is duplicate then it will return error as duplicate mobile number
    @IsMobilePhone('en-IN')
    mobile: string;

    @Column()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @Column({ default: true })
    status: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    last_login: Date;

    @Column({ nullable: true })
    ip_address: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
}
