STEP 1: SUPER ADMIN LOGIN (Software chalu karna)
Super admin software ka malik hai. Wo software set up karta hai.

1. "Companies" Menu

Kya karega: "Add Company" pe click karega. Company ka naam (e.g., Orbitrex Peptides) aur details daalega.
Data kahan jayega: Database ki Company table mein.
2. "Users" Menu

Kya karega: "Add User" karega. Naam, Email, aur Password set karega, aur Role select karega "WAREHOUSE_MANAGER". Is manager ko Orbitrex company se link kar dega.
Data kahan dikhega: Ab manager apne email/password se login kar payega.
(Super Admin ka kaam khatam. Ab Manager login karega)


-------------------------------------------------------------------

STEP 2: MANAGER LOGIN (Godown ka Setup karna)
Manager ke paas khali godown hai. Usey sabse pehle system mein set karna hai.

1. "Locations" Menu

Kya karega: Manager yahan aakar Godown ka address banayega. E.g., Zone A -> Rack 1 -> Bin 1.
Data kahan dikhega: Ye Bins aage chal kar "Inventory" aur "Picking" menus mein dikhenge jab maal wahan rakhna hoga.
2. "Products" Menu

Kya karega: Naya Product banayega (e.g., SKU: WHEY-01, Name: Whey Protein, Cost: $20).
Data kahan dikhega: Ye item "Sales Orders" (Client ke liye) aur "Lots & Batches" menu mein dikhne lagega. (Abhi stock zero (0) hai).
(Setup khatam. Ab naya maal factory se aayega)

----------------------------------------------------------------------

STEP 3: CLERK LOGIN (Naya Maal Aana - Inbound)
Godown par naya maal truck se utra hai. Clerk tablet lekar khada hai.

1. "Lots & Batches" (ya Receivings) Menu

Kya karega: Clerk naya maal receive karega. Wo "Whey Protein" select karega, uska Batch No. (B-001) aur Expiry Date (Dec 2026) daalega, aur Quantity (100 boxes) daalega.
Data kahan jayega:
Ye 100 boxes direct "Inventory" menu mein chale jayenge.
System usko ek Bin (Rack 1, Bin 1) assign kar dega.
2. "Inventory" Menu (Live Check)

Kahan se data aaya: Jo 100 boxes clerk ne receive kiye, wo yahan Bin Location Stock mein dikhne lagenge ki "Rack 1 mein 100 boxes pade hain".
Kya karega: Agar kabhi galti se 1 dabba toot jaye, toh Clerk yahan aakar "+ Audit Stock Adjustment" dabayega aur quantity ko 99 kar dega.
Data kahan jayega: Iski entry side wale tab "Transaction Ledger" mein life-time ke liye save ho jayegi ki "Ek dabba toota tha, isliye minus kiya".

-------------------------------------------------------------------------

STEP 4: CLIENT LOGIN (Maal Khareedna)
Ab client (customer) ko portal diya gaya hai saman khareedne ke liye.

1. "Catalog / Products" Menu (Client View)

Kahan se data aaya: Manager ne jo Product banaye the aur Clerk ne jo 99 boxes stock mein daale the, wo Client ko dikhenge. (Lekin cost price nahi dikhegi).
Kya karega: Client yahan se "Whey Protein" ko cart mein daal kar order place karega (Maan lo 50 boxes ka order).
2. "Sales Orders" Menu

Kya karega: Client ka order place ho gaya. Status hoga "Pending".
Data kahan jayega: Ye sidha Manager aur Clerk ke "Sales Orders" menu mein pop-up hoga!

------------------------------------------------------------------------

STEP 5: MANAGER & CLERK (Maal Bhejna - Outbound)
1. "Sales Orders" Menu (Manager View)

Kahan se data aaya: Client ne jo order lagaya tha.
Kya karega: Manager order dekhega aur "Approve" button dabayega.
Data kahan jayega: Approve hote hi ye order Clerk ke "Picking" menu mein chala jayega.
2. "Picking" Menu (Clerk View)

Kahan se data aaya: Manager ke approve kiye huye orders yahan task ban kar aate hain.
Kya karega: Software Clerk ko batayega -> "Bhai, Rack 1-Bin 1 mein jao, Batch B-001 uthao, Expiry pass mein hai isliye wahi wala uthana (FEFO logic)". Clerk 50 boxes nikal kar "Mark as Picked" karega.
Data kahan jayega: Stock 99 se minus hoke 49 ho jayega. Order ab "Shipping" menu mein chala jayega.
3. "Shipping" Menu

Kahan se data aaya: Jo items Pick ho gaye, wo pack hone ke liye yahan aate hain.
Kya karega: Clerk ya Dispatcher us par BlueDart ka sticker lagayega, Tracking Number daalega aur "Ship" pe click kar dega.
Data kahan jayega: Client ke dashboard par notification chali jayegi ki "Aapka maal nikal chuka hai".

-------------------------------------------------------------------------

STEP 6: MANAGER (Daily Checks)
1. "Expiry Tracking" Menu

Kahan se data aaya: Clerk ne jo shuru mein Batch aur Expiry Date daali thi (Step 3 mein).
Kya karega: Software daily check karega. Agar koi Batch 30 din mein expire hone wala hai, toh wo automatically is menu mein Red alert banke aa jayega. Manager yahan se us batch ko discount pe nikal sakta hai ya destroy kar sakta hai.
2. "Dashboard" Menu (Sabse Upar)

Kahan se data aaya: Pichle 5 steps mein jo bhi activity hui (Order aana, stock minus hona, expiry aana), us sab ka LIVE GRAPH, Total Sales, aur Live Warehouse Capacity yahan Manager ko chart ke form mein dikhega.
Summary:

Data paida hota hai: Locations & Products mein.
Data andar aata hai: Lots & Receivings se.
Data rakha jata hai: Inventory mein.
Data khareeda jata hai: Client ke Sales Orders se.
Data bahar jata hai: Picking & Shipping ke zariye.