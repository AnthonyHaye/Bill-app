/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      console.log("windowsIcone : " ,windowIcon);
      expect(windowIcon.classList.contains('active-icon')).toBe(true) 

    })
    
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })    
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      console.log("Dates triées :", datesSorted)  
      expect(dates).toEqual(datesSorted)
    })
  })
  describe("When I click on the 'New Bill' button" ,() => {
    test("Then it should navigate to the NewBill page", () => {
      const onNavigate = jest.fn()
      console.log (onNavigate)
      const billsContainer = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage})
      const buttonNewBill = screen.getByTestId("btn-new-bill")
      buttonNewBill.addEventListener('click', billsContainer.handleClickNewBill)
      userEvent.click(buttonNewBill)
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill'])
    })
  })



})
