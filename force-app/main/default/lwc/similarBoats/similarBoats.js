//Getting similar boats from DB

import { LightningElement,api,track,wire } from 'lwc';
import getSimilarBoats from '@salesforce/apex/BoatDataService.getSimilarBoats';
import { NavigationMixin } from 'lightning/navigation';


export default class SimilarBoats extends NavigationMixin(LightningElement) {
    // Private
    currentBoat;
    @track relatedBoats;
    boatId;
    error;
    
    // public
    @api
    get recordId() {
        // returns the boatId
        return this.boatId;
      }
      set recordId(value) {
          // sets the boatId value
          // sets the boatId attribute
          this.setAttribute('boat-id', value);
          this.boatId = this.recordId;
      }
    
    // public
    @api
    similarBy;
      
    // Wire custom Apex call, using the import named getSimilarBoats
    // Populates the relatedBoats list
    @wire (getSimilarBoats,({ boatId : '$boatId', similarBy : '$similarBy' }))
    similarBoats({ error, data }) { 
        if(data) {
            this.relatedBoats = data;
        } else if (error) {
            this.error = error;
        }
    }
    get getTitle() {
      return 'Similar boats by ' + this.similarBy;
    }
    get noBoats() {
      return !(this.relatedBoats && this.relatedBoats.length > 0);
    }
    
    // Navigate to record page
    openBoatDetailPage(event) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.detail.boatId,
                objectApiName: 'Boat__c',
                actionName: 'view'
            },
        });
     }
  }
  