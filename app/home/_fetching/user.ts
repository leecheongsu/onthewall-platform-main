import { collection, doc, getDocs, setDoc, Timestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ShortUniqueId from 'short-unique-id';
import { TERMS, UserProjectList } from '@/type/User';

export const insertUser = async () => {
  try {
    const allUserSnapshot = await getDocs(collection(db, 'User'));
    console.log('유저 데이터 가져오기');

    const allUserData = allUserSnapshot.docs.map((v) => {
      return { ...(v.data() as UserInfo), id: v.ref.id };
    });

    const now = Timestamp.now();

    for (const user of allUserData) {
      if (!user.projects || user.projects.length === 0) {
        const random = new ShortUniqueId().randomUUID(8);

        // 새 projectData 추가
        const newProject = {
          ownerId: user.uid ?? user.id,
          title: user.userName ?? user.id.slice(5),
          projectUrl: random,
          subscriptionModel: 'annual',
          tier: 'free',
          exhibitionLimit: 1,
          assignedExhibitionCount: 0,
          currentExhibitionCount: 0,
          adminExhibitionCount: 0,
          likeCount: 0,
          commentCount: 0,
          viewCount: 0,
          status: 'activated',
          expiredAt: Timestamp.fromDate(new Date('2025-10-30')),
          createdAt: user.createdAt ?? now,
          updatedAt: user.updatedAt ?? now,
          channelName: user.userName + random.slice(3),
          config: {
            adminMaxCount: 0,
            isAutoApproved: false,
            initialAssignCount: 0,
          },
          temp: 1,
        };

        const projectRef = doc(collection(db, 'Project'));
        await setDoc(projectRef, {
          id: projectRef.id,
          ...newProject,
        });
        console.log(`프로젝트 생성 ${user.id}: Project ID ${projectRef.id}`);

        const userRef = doc(db, 'User', user.id);
        await updateDoc(userRef, {
          uid: user.id,
          projects: [
            {
              id: projectRef.id,
              status: 'owner',
            },
          ],
        });
        console.log(`유저 프로젝트 업데이트 : ${user.userName}`);

        const newProjectDesign = {
          id: projectRef.id,
          title: '',
          description: '',
          logoUrl: '',
          faviconUrl: '',
          ogUrl: '',
          footer: {
            company: '',
            copyright: '',
          },
          blog: '',
          instagram: '',
          facebook: '',
          homepage: '',
          theme: {
            primary: '',
            secondary: '',
          },
          channelData: {
            bannerData: {
              desktop: {
                url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-1.png?alt=media&token=0d6534ee-b7e5-4603-b02e-3677845e5744',
              },
              mobile: {
                url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243',
              },
            },
            thumbnail:
              'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/assets%2FdummyImage%2FMale_Avatar.jpg?alt=media&token=3da72a35-69f4-4f05-a46c-0dbef2623311',
            description: '',
            information: '',
            facebook: '',
            x: '',
            instagram: '',
            shop: '',
            homepage: '',
            blog: '',
          },
          createdAt: now,
          updatedAt: now,
          temp: 1,
        };

        const projectDesignRef = doc(collection(db, 'ProjectDesign'));
        await setDoc(projectDesignRef, newProjectDesign);
        console.log(`디자인 생성 : ${projectRef.id}`);

        const newSections = [
          {
            projectId: projectRef.id,
            order: 0,
            type: 'BLANK',
            desktop: {
              url: '',
              height: '',
            },

            hasMobile: false,
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
          },
          {
            projectId: projectRef.id,
            order: 1,
            type: 'BANNER',
            desktop: {
              url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-1.png?alt=media&token=0d6534ee-b7e5-4603-b02e-3677845e5744',
              height: '',
            },
            hasMobile: false,
            mobile: {
              url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%[…]?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243',
              height: '',
            },
            hasLink: false,
            linkUrl: '',
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
          },
          {
            projectId: projectRef.id,
            order: 2,
            type: 'BLANK',
            desktop: {
              url: '',
              height: '',
            },
            hasMobile: false,
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
          },
        ];

        await Promise.all(
          newSections.map(async (section) => {
            const sectionRef = doc(collection(db, `ProjectDesign/${projectRef.id}/Section`));
            await setDoc(sectionRef, section);
          })
        );
        console.log(`섹션 생성 ${projectRef.id}`);
      }
    }
    console.log('전체 성공');
  } catch (e) {
    console.log('Insert User Error : ', e);
  }
};

export const validUser = async () => {
  try {
    const allUserSnapshot = await getDocs(collection(db, 'User'));
    console.log('유저 데이터 가져오기', allUserSnapshot.docs.length);

    const checkUserFields = (data: any, id: string) => {
      return {
        uid: data.uid || id,
        social: data.social,
        email: '',
        userName: data.userName,
        countryCodeText: data.countryCodeText || 'KR',
        countryCode: data.countryCode || 82,
        phone: data.phone,
        avatar: data.avatar || '',
        information: data.information || '',
        survey: {
          referrer: data.survey?.referrer || 'none',
          refEtcText: data.survey?.refEtcText || '',
        },
        status: data.status,
        projects: data.projects,
        history: data.history || '',
        paymentStatus: {
          paid: data.paymentStatus?.paid || true,
          billingKey: data.paymentStatus?.billingKey || true,
        },
        alarmStatus: {
          email: data.alarmStatus?.email || false,
          kakao: data.alarmStatus?.kakao || false,
          marketing: data.alarmStatus?.marketing || false,
        },
        terms: {
          termC_1: data.terms?.termC_1 || true,
          termC_2: data.terms?.termC_2 || true,
        },
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt || Timestamp.now(),
        password: data.password || '',
        channelName: data.channelName || data.userName + '0927',
        assignedCount: data.assignedCount || 0,
        exhibitionCount: data.exhibitionCount || 0,
      };
    };

    const BATCH_SIZE = 200;
    let operationCounter = 0;
    let batch = writeBatch(db);

    for (const doc of allUserSnapshot.docs) {
      const data = doc.data();

      if (data.social === 'kakao' && data.email === 'anonymous') {
        const updatedData = checkUserFields(data, doc.id);

        batch.set(doc.ref, updatedData);

        operationCounter++;

        if (operationCounter === BATCH_SIZE) {
          console.log('200개 커밋');
          await batch.commit();
          console.count('200개 업데이트 성공)');
          operationCounter = 0;
          batch = writeBatch(db);
        }
      }
    }

    await batch.commit();
    console.log('유저 데이터가 업데이트되었습니다.');
  } catch (e) {
    console.error('Batch User Error : ', e);
  }
};
