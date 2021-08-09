import { LightningElement,wire,track,api} from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { MessageContext,publish } from 'lightning/messageService';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { refreshApex } from '@salesforce/apex';
// ...
const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT     = 'Ship it!';
const SUCCESS_VARIANT     = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';
export default class BoatSearchResults extends LightningElement {
  @track selectedBoatId;
  columns = [
    { label: 'Name', fieldName: 'Name', editable: true, type: 'text' },
    { label: 'Length', fieldName: 'Length__c', editable: true, type: 'number' },
    { label: 'Price', fieldName: 'Price__c', editable: true, type: 'currency', typeAttributes: { currencyCode: 'USD' } },
    { label: 'Description', fieldName: 'Description__c', editable: true, type: 'text' }
  ];
  @track boatTypeId = '';
  @track boats;
  isLoading = false;
  
  // wired message context
  @wire(MessageContext)
  messageContext;
  // wired getBoats method 
  @wire(getBoats, { boatTypeId : '$boatTypeId'})
  wiredBoats(result) {
    if(result) {
      this.boats = result;
      this.notifyLoading(false);
   }
  }
  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) {
    this.boatTypeId = boatTypeId;
    this.notifyLoading(true);
   }

  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api
  async refresh() {
    this.notifyLoading(true);
    await refreshApex(this.boats);
    this.notifyLoading(false);
   }
    // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile (event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) {
    publish(this.messageContext, BOATMC, { recordId: boatId });

  }
  
  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    // notify loading
    const updatedFields = event.detail.draftValues;
    console.log(updatedFields);
    // Update the records via Apex
    updateBoatList({data: updatedFields})
      .then(() => {
        this.refresh();
        this.template.querySelector('lightning-datatable').draftValues = [];
        this.dispatchEvent(
          new ShowToastEvent({
              title: SUCCESS_TITLE,
              message: MESSAGE_SHIP_IT,
              variant: SUCCESS_VARIANT
            })
        );
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
          title: ERROR_TITLE,
          variant: ERROR_VARIANT
        })
      );
      });
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
  /*if(this.isLoading === isLoading){
      return this.isLoading = isLoading;
    }*/
    if(isLoading) {
      this.dispatchEvent(new CustomEvent('loading'));
    }else {
      this.dispatchEvent(new CustomEvent('doneloading'));
    }
   }
}
