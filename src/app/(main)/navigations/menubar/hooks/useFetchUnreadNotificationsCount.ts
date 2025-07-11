import { API_ENDPOINTS } from "@/lib/constants";
import kyInstance from "@/lib/ky";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { NotificationCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

interface UseFetchUnreadNotificationsCount {
  /** We do not have to wait client to fetch this data instead after we refresh the page we immediately fetch the unread count from the server. */
  initialState: NotificationCountInfo;
}

const MILISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;

export function useFetchUnreadNotificationsCount({
  initialState,
}: UseFetchUnreadNotificationsCount) {
  const unreadNotificationsCountQuery = useQuery({
    queryKey: QUERY_KEYS.unreadNotificationsCount,
    /** Server end point */
    queryFn: () =>
      kyInstance
        .get(API_ENDPOINTS.unreadNotificationsCount)
        .json<NotificationCountInfo>(),
    /**
     * To provide default data before the query actually fetches real data from the server.
     */
    initialData: initialState,
    /** Make req to the server every minute to fetch the latest unread count
     * TODO: change it later to real time notifications
     */
    refetchInterval: SECONDS_IN_MINUTE * MILISECONDS_IN_SECOND,
  });

  return unreadNotificationsCountQuery;
}
