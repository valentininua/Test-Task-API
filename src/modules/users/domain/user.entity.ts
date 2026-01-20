export type UserProps = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
};

export class UserEntity {
  constructor(private readonly props: UserProps) {}

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get email() {
    return this.props.email;
  }
  get phone() {
    return this.props.phone;
  }
  get dateOfBirth() {
    return this.props.dateOfBirth;
  }
}

