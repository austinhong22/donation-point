# 5-Minute Demo Script

## Setup

1. Start MySQL with Docker Compose
2. Run the backend
3. Run the frontend
4. Open `http://localhost:5173`

## 1. Donor

1. Switch actor to `Demo Donor`
2. Show the donor dashboard balance and existing donor history
3. Create a new mock payment, for example `50,000 KRW`
4. In the payment list, click `Convert`
5. Point out the increased donor balance
6. Create a new allocation to `Green Shelter`
7. Open the allocation detail and show:
   - donor
   - charity
   - allocated points
   - timeline events

## 2. Charity Manager

1. Switch actor to `Demo Charity Manager`
2. Show received allocations and remaining points
3. Select the newly funded allocation
4. Choose a partner product and quantity
5. Point out remaining points before and after order creation
6. Create the order
7. Show the charity order history and open the shared allocation trace

## 3. Admin

1. Switch actor to `Demo Admin`
2. Show dashboard summary cards
3. In the orders table, inspect the order funded by the allocation
4. Open the allocation detail timeline
5. Click `Complete`
6. Show the order status moving to fulfilled
7. Re-open the timeline and point out the fulfillment event

## Closing Point

End by showing that one allocation can be traced end to end:

- donor payment
- point conversion
- charity allocation
- partner order
- admin fulfillment
