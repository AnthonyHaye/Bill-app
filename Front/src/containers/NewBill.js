import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile.bind(this))
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault();
    console.log("la methode this.handleChangeFile est bien déclenché")
    
    const fileInput = this.document.querySelector(`input[data-testid="file"]`);
    console.log("le file input", fileInput)
    const file = fileInput.files[0];
    
    if (!file) {
      console.error("Aucun fichier sélectionné");
      return;
    }
      
    
    console.log("Fichier sélectionné : ", file);
    console.log("Type de fichier : ", file.type);
    console.log("Taille de fichier : ", file.size);
    
    const filePath = e.target.value.split(/\\/g);
    const fileName = file.name;
    console.log("filePath", filePath)
    console.log("fileName", fileName)
    console.log("Nom du fichier dans handle:", file.name);

    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const fileExtension = fileName.split('.').pop().toLowerCase();
    console.log("fileextension", fileExtension)

    console.log("fichier avant d'être accepté")

    if (!allowedExtensions.includes(fileExtension)) {
      alert('Seules les images de type jpg, jpeg ou png sont autorisées.');
      fileInput.value = ''; 
      return;
    }
    console.log("fichier accepté")

    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append('file', file);
    formData.append('email', email);
    
    console.log("formData à soumettre:", formData.get('file'), formData.get('email'));
    console.log("Appel de this.store.bills().create()");
    this.store.bills().create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        console.log("Réponse de l'API:", fileUrl, key);
        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        console.log("fileName mis à jour:", this.fileName);
      }).catch(error => console.error(error));
}

  handleSubmit = e => {
    e.preventDefault()
    console.log("handleSubmit appelé");
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    console.log("Facture créée : ", bill);
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}