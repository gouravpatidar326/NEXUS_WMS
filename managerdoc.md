🟢 Jo Menus 100% Database (MySQL) se Jude Hain:
Dashboard: Live hai (Upar ke cards aur Recent Dispatches DB se chal rahe hain).
Products: Live hai (Aap product bana rahe hain wo DB mein ja raha hai).
Locations: Live hai (Bins aur Rack ki capacity DB se uth rahi hai).
Sales Orders: Live hai (Client ke orders DB mein ja rahe hain).
Picking: Live hai (Pick lists generate ho rahi hain aur inventory se link hain).
Shipping: Live hai (Shipping labels DB mein save ho rahe hain).
(Abhi tak humne milkar yahi pura primary flow - 'Order aane se lekar ship hone tak' - Database se successfully connect kar diya hai) 🎉

🔴 Jo Menus Abhi "MOCK" (Dummy Data) Par Chal Rahe Hain (Database se judna baaki hai):
1. Lots & Batches

Flow & Use: Khas taur par dawaiyon ya chemicals (peptides) mein har supply ka ek 'Lot Number' hota hai aur uska testing certificate (COA) hota hai. Jab bhi bahar se (Purchase Order ke zariye) naya stock aata hai, toh uske sath hum Lot ID aur Mfg Date dalte hain. Agar koi Batch test mein fail ho jaye, toh use yahan se Quarantine kar dete hain (taaki order mein pack na ho sake). Abhi is page par jo Lots dikh rahe hain, wo fake (dummy) data se aa rahe hain.
2. Expiry Tracking

Flow & Use: Ye seedha Lots & Batches se juda hai. Jo products jaldi kharab hone wale hote hain (FEFO - First Expire First Out principle). Is module ka kaam hai aapko automatically alert dena ki "Ye wale Lots agle 30 din mein expire hone wale hain, inko discount pe nikalo ya fenk do (clearance)". Abhi ye alert system dummy data par chal raha hai.
3. Transfers (Transfer Orders)

Flow & Use: Ek warehouse se dusre warehouse (ya branch) mein saaman bhejney ko Transfer kehte hain. Maan lijiye aapka 'East Coast Hub' mein stock khatam ho gaya par 'West Coast' mein pada hai, toh aap ek Transfer Order banate hain ki "Wahan se 100 peti idhar bhej do". Jab truck wahan se nikalta hai toh status 'Dispatched' hota hai, aur jab aap yahan receive karte hain toh Inventory mein add ho jata hai. Iska API connection abhi bacha hai.
4. Reports

Flow & Use: Management ke liye hota hai. Pichle 1 mahine mein kitne order pack hue, kitna stock gayab hua (shrinkage), kis staff ne sabse tez kaam kiya, un sabka Analytics. Abhi isme jo graphs aur download button hain, wo system generate nahi kar raha, sirf design bani hui hai.
5. Purchase Orders (Receiving / Inbound)

(Peechhe code mein banaya tha par UI menu mein shayad directly nahi hai): Ye tab use hota hai jab aap supplier/factory se naya maal apne warehouse mein mangwate hain. Iske bina Inventory mein naya stock add karne ka standard flow adhoora hai.