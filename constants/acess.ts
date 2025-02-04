export const DENY_USER: Array<StatusOfUser> = ['owner', 'admin'];
export const ACCESS_ALL_USER: Array<StatusOfUser> = ['owner', 'admin', 'user'];

export const ACCESS_ALL_PROJECT: Array<StatusOfProject> = ['free', 'enterprise', 'business', 'personal'];
export const ACCESS_BUSINESS_AND_ABOVE: Array<StatusOfProject> = ['business', 'enterprise'];
export const ONLY_BUSINESS: Array<StatusOfProject> = ['business'];
export const ONLY_ENTERPRISE: Array<StatusOfProject> = ['enterprise'];
export const DENY_ENTERPRISE: Array<StatusOfProject> = ['business', 'personal', 'free'];
export const DENY_FREE: Array<StatusOfProject> = ['business', 'personal', 'enterprise'];
export const PERSONAL_BUSINESS: Array<StatusOfProject> = ['personal', 'business'];
