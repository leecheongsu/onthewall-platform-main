export const copyLink = (exhibitionId?: string, type: string = '') => {
  if (!exhibitionId) {
    return;
  }

  let linkToCopy = `https://art.onthewall.io/${exhibitionId}`; // 기본값 설정

  if (type === 'embed') {
    linkToCopy = `<iframe src="https://art.onthewall.io/${exhibitionId}" width="100%" height="100%" frameborder="0" scrolling="no"></iframe>`;
  } else if (type === 'External') {
    linkToCopy = exhibitionId;
  } else {
    linkToCopy = `https://art.onthewall.io/${exhibitionId}`;
  }

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(linkToCopy)
      .then(() => {
        console.log('링크가 클립보드에 성공적으로 복사되었습니다.');
      })
      .catch((err) => {
        console.error('클립보드 복사에 실패했습니다.', err);
      });
  } else {
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = linkToCopy;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    tempTextarea.setSelectionRange(0, 99999);

    try {
      document.execCommand('copy');
      console.log('Fallback: 링크가 클립보드에 성공적으로 복사되었습니다.');
    } catch (err) {
      console.error('Fallback: 클립보드 복사에 실패했습니다.', err);
    }

    document.body.removeChild(tempTextarea);
  }
};

export const redirect = (url: string) => {
  window.open(`https://art.onthewall.io/${url}`, '_blank');
};

// 유튜브 맹키로 k, m
export const formatNumber = (num: number): string => {
  if (num === undefined || num === null) {
    return '';
  }

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  } else {
    return num.toString();
  }
};
