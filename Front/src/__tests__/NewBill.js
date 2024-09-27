/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, fireEvent, waitFor } from "@testing-library/dom";
import mockStore from "../__mocks__/store.js";
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES_PATH } from "../constants/routes.js";

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    // Mock du localStorage
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: 'employee@test.tld'
    }));

    // Mock de window.alert
    window.alert = jest.fn();

    // Insérer l'UI dans le DOM
    document.body.innerHTML = NewBillUI();
  });

  test("Then the new bill form should be rendered", () => {
    expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    expect(screen.getByTestId("expense-name")).toBeTruthy();
    expect(screen.getByTestId("datepicker")).toBeTruthy();
    expect(screen.getByTestId("amount")).toBeTruthy();
    expect(screen.getByTestId("vat")).toBeTruthy();
    expect(screen.getByTestId("pct")).toBeTruthy();
    expect(screen.getByTestId("commentary")).toBeTruthy();
    expect(screen.getByTestId("file")).toBeTruthy();
  });

  test("When I upload a valid image file, it should call handleChangeFile", async () => {
    const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });
    const handleChangeFile = jest.fn(newBill.handleChangeFile);

    const inputFile = screen.getByTestId('file');
    inputFile.addEventListener("change", handleChangeFile);

    const file = new File(['file'], 'test.png', { type: 'image/png' });
    fireEvent.change(inputFile, { target: { files: [file] } });

    expect(handleChangeFile).toHaveBeenCalled();
    expect(inputFile.files[0].name).toBe('test.png');
  });

  test("When I upload an invalid file type, it should display an alert and not upload the file", async () => {
    const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });
    const inputFile = screen.getByTestId('file');
    const invalidFile = new File(['file'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(inputFile, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Seules les images de type jpg, jpeg ou png sont autorisées.');
    });

    expect(inputFile.value).toBe('');
  });

  test("When no file is selected, it should log an error and not call the store", async () => {
    const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const inputFile = screen.getByTestId('file');
    fireEvent.change(inputFile, { target: { files: [] } });

    const form = screen.getByTestId('form-new-bill');
    fireEvent.submit(form);

    expect(consoleErrorSpy).toHaveBeenCalledWith("Aucun fichier sélectionné");
    consoleErrorSpy.mockRestore();
  });

  test("When I submit a valid bill, it should call the store's update method", async () => {
    // Mock de la navigation
    const onNavigate = jest.fn();

    // Mock store.bills().update
    const updateMock = jest.fn().mockResolvedValue({});
    mockStore.bills = jest.fn(() => ({
      update: updateMock,
    }));

    // Instancie NewBill avec le store mocké
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    // Assure-toi que les valeurs sont bien présentes avant la soumission
    newBill.fileUrl = 'https://localhost/test.png';
    newBill.fileName = 'test.png';

    // Simule la soumission du formulaire
    const form = screen.getByTestId('form-new-bill');
    fireEvent.submit(form);

    // Vérifie que update a bien été appelé
    await waitFor(() => {
      expect(updateMock).toHaveBeenCalled();
    });

    // Vérifie que la redirection vers la page des factures a bien eu lieu
    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
  });

  
  test("When I upload a valid file, it should call the store's create method", async () => {
    // Mock la méthode onNavigate et le store
    const onNavigate = jest.fn();
    const createMock = jest.fn().mockResolvedValue({
      fileUrl: "https://localhost/test.png",
      key: "1234",
    });
  
    mockStore.bills = jest.fn(() => ({
      create: createMock,
    }));
  
    // Instancie la classe NewBill avec le store mocké
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });
  
    // Sélectionne l'input file
    const inputFile = screen.getByTestId("file");
  
    // Simule le changement de fichier avec un fichier valide (avec le nom 'test.png' uniquement)
    const validFile = new File(['test'], 'test.png', { type: 'image/png' });  
    
    // Simule l'upload
    fireEvent.change(inputFile, { target: { files: [validFile] } });  
    
    // Vérifiez que le fichier a bien le nom "test.png"
    expect(inputFile.files[0].name).toBe('test.png');
  
    // Vérifie que la méthode create a été appelée avec les bons paramètres
    await waitFor(() => {
      expect(createMock).toHaveBeenCalled();
      expect(createMock).toHaveBeenCalledWith({
        data: expect.any(FormData),
        headers: {
          noContentType: true,
        },
      });
    });
  
    // Vérifie que les propriétés de l'instance sont mises à jour
    expect(newBill.fileUrl).toBe("https://localhost/test.png");
    expect(newBill.billId).toBe("1234");
  });
});
  
