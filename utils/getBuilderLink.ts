// 빌더 링크 반환 함수
import { moduleApis } from '../api/module';
import { generateEncryptedParams } from '../utils/webHash';

const getBuilderLink = async (projectId: string, exhibitionId: string, status: string, token?: string) => {
  const params: Record<string, any> = {
    projectId: projectId,
    status: status,
  };
  const encryptedData = await generateEncryptedParams(params);
  if (token) {
    return `${process.env.NEXT_PUBLIC_ONTHEWALL_BUILDER_URL}/edit/${exhibitionId}?data=${encryptedData}&token=${token}`;
  }

  const res = await moduleApis.getEditTokenByExhibitionId(exhibitionId);
  return `${process.env.NEXT_PUBLIC_ONTHEWALL_BUILDER_URL}/edit/${exhibitionId}?data=${encryptedData}&token=${res.data.token}`;
};

export default getBuilderLink;
