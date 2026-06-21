export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  MeetingsList: undefined;
  MeetingDetail: { meetingId: string };
  CreateMeeting: undefined;
  ActionItemsList: undefined;
  OverdueItems: undefined;
};