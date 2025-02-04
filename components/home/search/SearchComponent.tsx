'use client';
// 테스트용 search 컴포넌트
import React, { use, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { algoliasearch } from 'algoliasearch';
import instantsearch from 'instantsearch.js';
import { searchBox, hits, configure, infiniteHits } from 'instantsearch.js/es/widgets';
import { useRouter, useSearchParams } from 'next/navigation';

// store
import { useLanguageStore } from '@/store/language';

// lib
import { useTranslation } from 'react-i18next';

// style
import styled from '@emotion/styled';

// components
import SearchCard from '@/components/home/search/SearchCard';
import { url } from 'inspector';

const searchClient = (algoliasearch as any)('3LISM4E1OZ', '6c3e5c74a4097b68efe2a81b84df2d85');

type Props = {
  projectId?: string;
};

const SearchComponent: React.FC<Props> = ({ projectId }) => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const searchParams = useSearchParams()?.get('search');

  useEffect(() => {
    const search = instantsearch({
      indexName: 'Exhibition',
      searchClient,
    });

    search.addWidgets([
      searchBox({
        container: '#searchbox',
        showReset: false,
        showLoadingIndicator: false,
        placeholder: t('Search for Exhibitions'),
        cssClasses: {
          input: 'search-input',
          submit: 'search-submit',
        },
      }),
      configure({
        hitsPerPage: 9,
        // numericFilters: 'isDeleted=0 AND isHidden=0 AND version=1 AND isPrivate=0 AND isEnded=0',
        numericFilters: ['version=2', 'isHidden=0', 'isDeleted=0'],

        facetFilters: projectId ? [`status:published`, `projectId:${projectId}`] : ['status:published'],

        //filters: 'status=published AND (projectTier=personal OR projectTier=business OR plan=business OR plan=basic)',
      }),
      // infiniteHits 위젯으로 변경
      infiniteHits({
        container: '#hits',
        templates: {
          item: (hit, { html, components }) => html`
            <div class="search-card" data-id="${hit.objectID}">
              <div class="search-thumbnail">
                <div class="search-image">
                  <img
                    src="${hit.thumbnailPosterImage.url ||
                    'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243'}"
                    alt="${hit.title}"
                  />
                </div>
              </div>
              <div class="search-text">
                <p class="search-title">${hit.title}</p>
                <p class="search-name">${hit.channelName ? hit.channelName : 'ONTHEWALL'}</p>
              </div>
            </div>
          `,
          empty: 'No results found.',
          showMoreText: 'More',
        },
      }),
    ]);

    search.start();

    if (searchParams && search.helper) {
      search.helper.setQuery(searchParams).search();
    }

    const handleCardClick = (event: any) => {
      const card = event.target.closest('.search-card');
      if (card) {
        const id = card.getAttribute('data-id');
        window.open(`https://art.onthewall.io/${id}`, '_blank');
      }
    };

    search.on('render', () => {
      const isAllData = document.querySelector('.ais-InfiniteHits-loadMore--disabled') as HTMLElement;
      if (isAllData) {
        isAllData.style.display = 'none';
      }
    });

    const hitsContainer = document.querySelector('#hits');
    hitsContainer?.addEventListener('click', handleCardClick);

    return () => {
      hitsContainer?.removeEventListener('click', handleCardClick);
    };
  }, []);

  return (
    <SearchContainer className="ais-InstantSearch">
      <SearchBoxContainer id="searchbox" />
      <HitsContainer id="hits" />
    </SearchContainer>
  );
};

export default SearchComponent;

const SearchContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  display: block;
  overflow: hidden;
  padding: 50px 0;
  margin: 0 auto;
  font-family: sans-serif;
  .ais-SearchBox-form {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }
  .search-input {
    width: 100%;
    padding: 10px;
    border-radius: 0px;
    border-bottom: 1px solid #ccc;
    font-size: 16px;
    box-sizing: border-box;
    transition: border-color 0.3s;
    :focus {
      outline: none;
      border-color: #007bff;
      transition: border-color 0.3s;
    }
  }

  .search-button {
    display: inline-block;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
  }

  .search-button:hover {
    background-color: #0056b3;
  }

  .search-submit {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #007bff;
    border-radius: 5px;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
    & > svg {
      width: 20px;
      height: 20px;
      fill: white;
    }
  }

  @media (max-width: 768px) {
    padding: 20px 0;
  }
`;

const SearchBoxContainer = styled.div`
  margin-bottom: 1em;
`;

const HitsContainer = styled.div`
  .ais-InfiniteHits-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
  .search-card {
    border: 1px solid #eeeeee;
    border-radius: 5px;
    overflow: hidden;
    cursor: pointer;
  }
  .search-thumbnail {
    width: 100%;
    height: 0;
    padding-bottom: 70%;
    position: relative;
  }
  .search-image {
    top: 0;
    left: 0;
    width: 100%;
    border: 1px solid #eee;
    border-radius: 5px 5px 0 0;
    height: 100%;
    display: flex;
    overflow: hidden;
    position: absolute;
    justify-content: center;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .search-text {
    padding: 15px;
  }
  .search-title {
    font-size: 16px;
    font-weight: 600;
    word-break: break-all;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    color: #212121;
  }
  .search-name {
    font-size: 14px;
    color: #757575;
  }
  .ais-InfiniteHits-loadMore {
    display: flex;
    justify-content: center;
    margin: 0 auto;
    margin-top: 20px;
    background-color: #007bff;
    color: #fff;
    border-radius: 5px;
    border: 1px solid #007bff;
    padding: 5px 20px;
    :hover {
      background-color: #0056b3;
      box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.15);
      transition: all 0.3s;
    }
  }
`;
