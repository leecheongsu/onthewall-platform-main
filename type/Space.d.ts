type Space = {
  id: string;
  title: string;
  description: string;
  area: number;
  basicPrice: number;
  businessPrice: number;
  category: string;
  createdAt?: any;
  updatedAt?: any;
  isDeleted: boolean;
  isPublic: boolean;
  matterportId: string; // matterport id
  maxNumOfPainting: number;
  order: number;
  owner: string | 'GDCOMM';
  price: { basic: number; business: number; };
  thumbnailImg: { path: string; url: string; };
}