"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { searchFlights, searchHotels } from "@/lib/api";
import { EMPTY_FLIGHT_FILTERS, EMPTY_HOTEL_FILTERS } from "@/lib/filters";
import { readStore, writeStore } from "@/lib/storage";
import type {
  Booking,
  CartItem,
  Currency,
  FlightFilters,
  FlightOffer,
  HotelFilters,
  HotelOffer,
  SearchQuery,
  SortKey,
  VisaApplication,
} from "@/types";
import type { HolidayBooking } from "@/lib/data/holidays";

export interface User {
  name: string;
  email: string;
}

type Status = "idle" | "loading" | "success" | "error";

interface State {
  hydrated: boolean;
  currency: Currency;
  user: User | null;
  authOpen: boolean;
  query: SearchQuery | null;
  history: SearchQuery[];
  status: Status;
  error: string | null;
  flights: FlightOffer[];
  hotels: HotelOffer[];
  flightFilters: FlightFilters;
  hotelFilters: HotelFilters;
  sort: SortKey;
  cart: CartItem | null;
  bookings: Booking[];
  visaApplications: VisaApplication[];
  holidayBookings: HolidayBooking[];
}

type Action =
  | { type: "hydrate"; payload: Partial<State> }
  | { type: "currency"; currency: Currency }
  | { type: "auth"; open: boolean }
  | { type: "login"; user: User | null }
  | { type: "searchStart"; query: SearchQuery }
  | { type: "flightsLoaded"; offers: FlightOffer[] }
  | { type: "hotelsLoaded"; offers: HotelOffer[] }
  | { type: "searchError"; error: string }
  | { type: "flightFilters"; filters: FlightFilters }
  | { type: "hotelFilters"; filters: HotelFilters }
  | { type: "sort"; sort: SortKey }
  | { type: "cart"; item: CartItem | null }
  | { type: "booked"; booking: Booking }
  | { type: "clearHistory" }
  | { type: "visaApplied"; application: VisaApplication }
  | { type: "holidayBooked"; booking: HolidayBooking };

const initialState: State = {
  hydrated: false,
  currency: "BDT",
  user: null,
  authOpen: false,
  query: null,
  history: [],
  status: "idle",
  error: null,
  flights: [],
  hotels: [],
  flightFilters: EMPTY_FLIGHT_FILTERS,
  hotelFilters: EMPTY_HOTEL_FILTERS,
  sort: "best",
  cart: null,
  bookings: [],
  visaApplications: [],
  holidayBookings: [],
};

const HISTORY_LIMIT = 6;

function sameQuery(a: SearchQuery, b: SearchQuery) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.payload, hydrated: true };
    case "currency":
      return { ...state, currency: action.currency };
    case "auth":
      return { ...state, authOpen: action.open };
    case "login":
      return { ...state, user: action.user, authOpen: false };
    case "searchStart":
      return {
        ...state,
        query: action.query,
        status: "loading",
        error: null,
        history: [action.query, ...state.history.filter((h) => !sameQuery(h, action.query))].slice(0, HISTORY_LIMIT),
        flightFilters: EMPTY_FLIGHT_FILTERS,
        hotelFilters: EMPTY_HOTEL_FILTERS,
        sort: "best",
      };
    case "flightsLoaded":
      return { ...state, status: "success", flights: action.offers };
    case "hotelsLoaded":
      return { ...state, status: "success", hotels: action.offers };
    case "searchError":
      return { ...state, status: "error", error: action.error };
    case "flightFilters":
      return { ...state, flightFilters: action.filters };
    case "hotelFilters":
      return { ...state, hotelFilters: action.filters };
    case "sort":
      return { ...state, sort: action.sort };
    case "cart":
      return { ...state, cart: action.item };
    case "booked":
      return { ...state, bookings: [action.booking, ...state.bookings], cart: null };
    case "clearHistory":
      return { ...state, history: [] };
    case "visaApplied":
      return { ...state, visaApplications: [action.application, ...state.visaApplications] };
    case "holidayBooked":
      return { ...state, holidayBookings: [action.booking, ...state.holidayBookings] };
  }
}

interface AppContextValue extends State {
  setCurrency: (c: Currency) => void;
  openAuth: () => void;
  closeAuth: () => void;
  login: (u: User) => void;
  logout: () => void;
  runSearch: (q: SearchQuery) => void;
  setFlightFilters: (f: FlightFilters) => void;
  setHotelFilters: (f: HotelFilters) => void;
  setSort: (s: SortKey) => void;
  setCart: (item: CartItem | null) => void;
  confirmBooking: (b: Booking) => void;
  clearHistory: () => void;
  addVisaApplication: (a: VisaApplication) => void;
  addHolidayBooking: (b: HolidayBooking) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const KEYS = {
  currency: "khz.currency",
  user: "khz.user",
  history: "khz.history",
  bookings: "khz.bookings",
  cart: "khz.cart",
  visa: "khz.visa",
  holidays: "khz.holidays",
};

const MIN_SKELETON_MS = 650;

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    dispatch({
      type: "hydrate",
      payload: {
        currency: readStore<Currency>(KEYS.currency, "BDT"),
        user: readStore<User | null>(KEYS.user, null),
        history: readStore<SearchQuery[]>(KEYS.history, []),
        bookings: readStore<Booking[]>(KEYS.bookings, []),
        cart: readStore<CartItem | null>(KEYS.cart, null, "session"),
        visaApplications: readStore<VisaApplication[]>(KEYS.visa, []),
        holidayBookings: readStore<HolidayBooking[]>(KEYS.holidays, []),
      },
    });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    writeStore(KEYS.currency, state.currency);
    writeStore(KEYS.user, state.user);
    writeStore(KEYS.history, state.history);
    writeStore(KEYS.bookings, state.bookings);
    writeStore(KEYS.cart, state.cart, "session");
    writeStore(KEYS.visa, state.visaApplications);
    writeStore(KEYS.holidays, state.holidayBookings);
  }, [state.hydrated, state.currency, state.user, state.history, state.bookings, state.cart, state.visaApplications, state.holidayBookings]);

  const runSearch = useCallback((q: SearchQuery) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    dispatch({ type: "searchStart", query: q });
    const started = Date.now();
    const delay = () => new Promise((r) => setTimeout(r, Math.max(0, MIN_SKELETON_MS - (Date.now() - started))));

    const run = async () => {
      try {
        if (q.kind === "flight") {
          const offers = await searchFlights(q, ctrl.signal);
          await delay();
          if (!ctrl.signal.aborted) dispatch({ type: "flightsLoaded", offers });
        } else {
          const offers = await searchHotels(q, ctrl.signal);
          await delay();
          if (!ctrl.signal.aborted) dispatch({ type: "hotelsLoaded", offers });
        }
      } catch (err) {
        if (ctrl.signal.aborted) return;
        dispatch({ type: "searchError", error: err instanceof Error ? err.message : "Something went wrong" });
      }
    };
    void run();
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      setCurrency: (currency) => dispatch({ type: "currency", currency }),
      openAuth: () => dispatch({ type: "auth", open: true }),
      closeAuth: () => dispatch({ type: "auth", open: false }),
      login: (user) => dispatch({ type: "login", user }),
      logout: () => dispatch({ type: "login", user: null }),
      runSearch,
      setFlightFilters: (filters) => dispatch({ type: "flightFilters", filters }),
      setHotelFilters: (filters) => dispatch({ type: "hotelFilters", filters }),
      setSort: (sort) => dispatch({ type: "sort", sort }),
      setCart: (item) => dispatch({ type: "cart", item }),
      confirmBooking: (booking) => dispatch({ type: "booked", booking }),
      clearHistory: () => dispatch({ type: "clearHistory" }),
      addVisaApplication: (application) => dispatch({ type: "visaApplied", application }),
      addHolidayBooking: (booking) => dispatch({ type: "holidayBooked", booking }),
    }),
    [state, runSearch],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}
