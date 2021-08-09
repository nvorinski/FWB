import { LightningElement,api,track } from 'lwc';
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';
import deleteReview from '@salesforce/apex/BoatDataService.deleteReview';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// imports
export default class BoatReviews extends NavigationMixin(LightningElement) {
    // Private
    @track boatId;
    @track error;
    @track boatReviews;
    @track isLoading;
    
    // Getter and Setter to allow for logic to run on recordId change
    @api get recordId() { 
        return this.boatId;
    }
    set recordId(value) {
      //sets boatId attribute
      //sets boatId assignment
      //get reviews associated with boatId
      this.setAttribute('boat-id',value);
      this.boatId = value;
      this.getReviews();
    }
    
    // Getter to determine if there are reviews to display
    get reviewsToShow() {
        return this.boatReviews !== null && this.boatReviews !== undefined && this.boatReviews.length;
     }
    
    // Public method to force a refresh of the reviews invoking getReviews
    @api
    refresh() { 
        this.getReviews();
    }
    
    // Imperative Apex call to get reviews for given boat
    // returns immediately if boatId is empty or null
    // sets isLoading to true during the process and false when it’s completed
    // Gets all the boatReviews from the result, checking for errors.
    getReviews() {
        this.isLoading = true;
        getAllReviews({ boatId : this.boatId })
            .then((result) => {
                this.boatReviews = result;
                this.error = undefined;
            })
            .catch((error) => {
                this.error = error;
                this.boatReviews = undefined;
            })
            .finally(() => {
                this.isLoading = false;
            })
     }
     handleDelete(event){
        this.isLoading = true;
        deleteReview({ review : event.target.value })
            .then((result) => {
                this.dispatchEvent(new ShowToastEvent({
                    title : 'Successfully deleted',
                    variant : 'success',
                    message : 'Review with subject: ' + result
                }));
            })
            .catch((error) => {
                this.error = error;
                this.boatReviews = undefined;
            })
            .finally(() => {
                this.isLoading = false;
                this.refresh();
            })
     }

    // Helper method to use NavigationMixin to navigate to a given record on click
    navigateToRecord(event) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.target.dataset.recordId,
                objectApiName: 'User',
                actionName: 'view'
            },
        });
     }
  }
  