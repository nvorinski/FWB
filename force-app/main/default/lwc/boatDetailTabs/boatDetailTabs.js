import labelAddReview from '@salesforce/label/c.Add_Review';
import labelDetails from '@salesforce/label/c.Details';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';
import labelReviews from '@salesforce/label/c.Reviews';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
import { APPLICATION_SCOPE, MessageContext, subscribe } from 'lightning/messageService';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { wire, LightningElement } from 'lwc';
const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];

export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  boatId;
  wiredRecord;
  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat,
  };
  
  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  get detailsTabIconName() {
      return this.wiredRecord ? 'utility:anchor' : null; 
   }
   
   @wire (MessageContext)
   messageContext;

   @wire(getRecord, { recordId : '$boatId', fields : BOAT_FIELDS })
   wiredRecord;

  // Utilize getFieldValue to extract the boat name from the record wire
  get boatName() {
      return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
   }
  
  // Private
  subscription = null;
  
  // Subscribe to the message channel
  subscribeMC() {
    // local boatId must receive the recordId from the message
    this.subscription = subscribe (
        this.messageContext,
        BOATMC,
        (message) => {this.boatId = message.recordId},
        { scope : APPLICATION_SCOPE }
    )
  }
  
  // Calls subscribeMC()
  connectedCallback() {
      if(!this.subscription) {
          this.subscribeMC();
      }
   }
  
  // Navigates to record page
  navigateToRecordViewPage() { 
    this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            recordId: this.boatId,
            objectApiName: 'Boat__c',
            actionName: 'view'
        },
    });
  }

  // Navigates back to the review list, and refreshes reviews component
  handleReviewCreated() {
    this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
   const reviews = this.template.querySelector('c-boat-reviews');
   if(reviews) reviews.refresh();
   }
}
