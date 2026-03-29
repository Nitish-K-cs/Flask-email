#create
# - firstname
# - lastname
# - email

from flask import Flask, request, jsonify
from config import app, db  
from models import Contact


#-----------------
#GET CONTACTS
#-----------------

@app.route('/contacts', methods=['GET'])
def get_contacts():
    contacts = Contact.query.all()
    json_contacts = list(map(lambda contact: contact.to_json(), contacts))
    return jsonify({"contacts": json_contacts})


#-----------------
# CREATE CONTACT
#-----------------


@app.route('/create_contact', methods=['POST'])
def create_contact():
    data = request.get_json()
    contact = Contact(
        fname=data['firstName'],
        lname=data['lastName'],
        email=data['email']
    )
    if not contact.fname or not contact.lname or not contact.email:
        return (jsonify({"error": "Missing required fields"})
                , 400)

    try:        
        db.session.add(contact)
        db.session.commit() 
    except Exception as e:
        db.session.rollback()
        return (jsonify({"error": str(e)})
                , 400)
    
    return jsonify(contact.to_json() | {"message": "Contact created successfully"}), 201


#-----------------
# UPDATE CONTACT
#-----------------

@app.route('/update_contact/<int:contact_id>', methods=['PUT'])
def update_contact(contact_id):
    contact = Contact.query.get(contact_id)
    if not contact:
        return (jsonify({"error": "Contact not found"})
                , 404)

    data = request.get_json()
    contact.fname = data.get('firstName', contact.fname)
    contact.lname = data.get('lastName', contact.lname)
    contact.email = data.get('email', contact.email)

    try:
        db.session.commit() 
    except Exception as e:
        db.session.rollback()
        return (jsonify({"error": str(e)})
                , 400)

    return jsonify(contact.to_json() | {"message": "Contact updated successfully"}), 200


#-----------------
# DELETE CONTACT
#-----------------

@app.route('/delete_contact/<int:contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    contact = Contact.query.get(contact_id)
    if not contact:
        return (jsonify({"error": "Contact not found"})
                , 404)

    try:
        db.session.delete(contact)
        db.session.commit() 
    except Exception as e:
        db.session.rollback()
        return (jsonify({"error": str(e)})
                , 400)

    return jsonify({"message": "Contact deleted successfully"}), 200


#-----------------
# main
#-----------------

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create tables if they don't exist

    
    app.run(debug=True)