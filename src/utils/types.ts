export type TUserResponse = {
  success: boolean;
  message: string;
  user: {
    $__: {
      activePaths: {
        paths: {
          password: string;
          name: string;
          email: string;
        };
        states: {
          require: {
            password: boolean;
            name: boolean;
            email: boolean;
          };
          default: Record<string, unknown>;
          modify: Record<string, unknown>;
        };
      };
      op: null | unknown;
      saving: null | unknown;
      $versionError: null | unknown;
      saveOptions: null | unknown;
      validating: null | unknown;
      cachedRequired: Record<string, unknown>;
      backup: {
        activePaths: {
          modify: {
            email: boolean;
            name: boolean;
            password: boolean;
            verificationTokenExpiresAt: boolean;
            verificationToken: boolean;
            createdAt: boolean;
            updatedAt: boolean;
          };
          default: {
            lastLogin: boolean;
            isVerified: boolean;
            role: boolean;
            _id: boolean;
          };
        };
        validationError: null | unknown;
      };
      inserting: boolean;
      savedState: Record<string, unknown>;
    };
    _doc: {
      email: string;
      name: string;
      password: string;
      lastLogin: string;
      isVerified: boolean;
      role: string;
      verificationTokenExpiresAt: string;
      verificationToken: string;
      _id: string;
      createdAt: string;
      updatedAt: string;
      __v: number;
    };
    $isNew: boolean;
  };
};
