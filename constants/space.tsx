export const NEWSPACE = [
  {
    label: 'Space Thumbnail',
    description: 'Please upload a thumbnail image for the space.',
    type: 'thumbnail',
  },
  {
    label: 'Space Name',
    description: 'Please enter the name of the space.',
    type: 'text',
    name: 'title',
    placeholder: 'Enter the name of the space',
  },
  {
    label: 'Space Description',
    description: 'Please enter the description of the space.',
    type: 'text',
    name: 'description',
    placeholder: 'Enter the description of the space',
  },
  {
    label: 'Matterport Id',
    description: 'Please enter the Matterport ID of the space.',
    type: 'text',
    name: 'matterportId',
    placeholder: 'Enter the Matterport ID of the space',
  },
  {
    label: 'Area (m2)',
    description: 'Please enter the m2 of the space.',
    type: 'text',
    name: 'area',
    placeholder: 'Enter the m2 of the space',
  },
  {
    label: 'Max Number of Painting',
    description: 'Please enter the max number of painting of the space.',
    type: 'text',
    name: 'maxNumOfPaingting',
    placeholder: 'Enter the max number of painting of the space',
  },
  {
    label: 'Public',
    description: 'Please select the public status of the space.',
    type: 'select',
    name: 'isPublic',
    options: [
      { value: 'true', label: '공개' },
      { value: 'false', label: '비공개' },
    ],
  },
  {
    label: 'Project URL',
    description: 'Please enter the Project URL.',
    // type: 'text',
    name: 'projectUrl',
    placeholder: 'Enter the URL',
  },
];

export const MYSPACE = [
  {
    label: 'Project URL',
    description: 'Please enter the Project URL.',
    name: 'projectUrl',
    placeholder: 'Enter the URL',
  },
  {
    label: 'Matterport ID',
    description: 'Please enter the Matterport ID.',
    name: 'matterportId',
    placeholder: 'Enter the Matterport ID',
  },
];
