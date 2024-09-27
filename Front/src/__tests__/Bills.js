/**
 * @jest-environment jsdom
 */
import mockStore from "../__mocks__/store.js";
import {screen, waitFor} from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";

// Simule le store
jest.mock("../app/Store.js", () => ({
  __esModule: true,  // Indiquer à Jest que c'est un module ES6
  default: mockStore, // Remplacer l'export par défaut par le mock
}));

// Fonction pour initialiser le DOM et la navigation
  const setupTestEnvironment = () => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
  
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();
  };

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    setupTestEnvironment(); // Mise en place du DOM avant chaque test
    jest.spyOn(mockStore, "bills")
  }); 

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      expect(windowIcon.classList.contains('active-icon')).toBe(true);
    });
    
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });    
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  describe("When I click on the 'New Bill' button", () => {
    test("Then it should navigate to the NewBill page", () => {
      document.body.innerHTML = BillsUI({ data: bills });

      const onNavigate = jest.fn();
      const billsContainer = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      const buttonNewBill = screen.getByTestId("btn-new-bill");

      buttonNewBill.addEventListener('click', billsContainer.handleClickNewBill);
      userEvent.click(buttonNewBill);

      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
    });
  });

  describe("When I click on the eye icon of a bill", () => {
    test("Then a modal should open with the bill image", async () => {
      document.body.innerHTML = BillsUI({ data: bills });
      $.fn.modal = jest.fn(); 
  
      const onNavigate = jest.fn();
      const billsContainer = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });
      const iconEye = screen.getAllByTestId("icon-eye")[0];
  
      const handleClickIconEye = jest.fn(() => billsContainer.handleClickIconEye(iconEye));
      iconEye.addEventListener('click', handleClickIconEye);
      userEvent.click(iconEye);
  
      expect(handleClickIconEye).toHaveBeenCalled();
      const modal = await waitFor(() => document.getElementById('modaleFile'));
      expect(modal).toBeTruthy();
  
      const img = modal.querySelector("img");
      expect(img).toBeTruthy();
      expect(img.src).toMatch(/^https?:\/\//);
      expect($.fn.modal).toHaveBeenCalledWith('show');
    });
  });

  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET and displays them", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES_PATH[pathname];
      };

      const billsContainer = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const fetchedBills = await billsContainer.getBills();

      expect(fetchedBills.length).toBeGreaterThan(0);
      expect(fetchedBills[0].date).toEqual("2004-04-04");
      expect(fetchedBills[0].status).toEqual("En attente");
    });
  });

  describe("When an error occurs during the fetching of bills", () => {
    test("should log the error and return unformatted data", async () => {
      jest.spyOn(mockStore.bills(), 'list').mockImplementationOnce(() => {
        return Promise.resolve([{ date: "invalid-date", status: "invalid-status" }]);
      });
  
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES_PATH[pathname];
      };
  
      const billsContainer = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const fetchedBills = await billsContainer.getBills();
  
      expect(fetchedBills[0].date).toBe("invalid-date");
  
      expect(fetchedBills[0].status).toBe("invalid-status");
    });
  }); 
  
  test("Then, ErrorPage should be rendered when a 404 error occurs", async () => {
    mockStore.bills.mockImplementationOnce(() => ({
      list: () => Promise.reject(new Error("Erreur 404"))
    }));
    document.body.innerHTML = BillsUI({ error: "Erreur 404" });
    expect(screen.getByText(/Erreur 404/)).toBeTruthy();
  });

  test("Then, ErrorPage should be rendered when a 500 error occurs", async () => {
    mockStore.bills.mockImplementationOnce(() => ({
      list: () => Promise.reject(new Error("Erreur 500"))
    }));
    document.body.innerHTML = BillsUI({ error: "Erreur 500" });
    expect(screen.getByText(/Erreur 500/)).toBeTruthy();
  });
});
