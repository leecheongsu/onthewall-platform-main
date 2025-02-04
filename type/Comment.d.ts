export type Comment = {
	id: string;
	name: string;
	value: string;
	channelId: string;
	exhibition?: any;
	createdAt: { _seconds: number };
};
